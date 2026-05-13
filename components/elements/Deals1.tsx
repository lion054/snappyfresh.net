import { toast } from 'react-toastify';

import Link from 'next/link';
import { useCart } from "../../hooks";
import { normalizeProductForCart, createDefaultUOM } from "../../lib/productTransformer";
import { logger } from "../../lib/logger";
import Timer from "./Timer";
import { PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

const Deals1 = ({ product }: { product: any }) => {
    const { addToCart } = useCart();

    const handleCart = (product: any) => {
        try {
            const normalizedProduct = normalizeProductForCart(product);
            const uom = createDefaultUOM(normalizedProduct);
            addToCart(normalizedProduct, uom);
        } catch (error) {
            logger.error("Error adding product to cart:", error);
            toast.error("Failed to add product to cart");
        }
    };
    return (
        <>
            <div className="product-cart-wrap style-2 wow animate__animated animate__fadeInUp" data-wow-delay="0">
                <div className="product-img-action-wrap">
                    <div className="product-img">
                        <Link href="/store">
                            <img src={product.discount?.banner || product.image || PRODUCT_FALLBACK_IMAGE} alt={product.title || "Deal"} />
                        </Link>
                    </div>
                </div>
                <div className="product-content-wrap">
                    <div className="deals-countdown-wrap">
                        <Timer endDateTime="2026-11-27 00:00:00" />
                    </div>
                    <div className="deals-content">
                        <h2>
                            <Link href="/product/[slug]" as={`/product/${product.slug}`}>
                                {product.title}
                            </Link>
                        </h2>
                        <div className="product-rate-cover">
                            <div className="product-rate d-inline-block">
                                <div className="product-rating" style={{ width: "90%" }}></div>
                            </div>
                            <span className="font-small ml-5 text-muted"> (4.0)</span>
                        </div>
                        <div>
                            <span className="font-small text-muted">
                                By{" "}
                                <Link href="/vendors">
                                    NestFood
                                </Link>
                            </span>
                        </div>
                        <div className="product-card-bottom">
                            <div className="product-price">
                                <span>${product.price}</span>
                                <span className="old-price">{product.oldPrice && `$ ${product.oldPrice}`}</span>
                            </div>
                            <div className="add-cart">
                                <a className="add" onClick={() => handleCart(product)}>
                                    <i className="fi-rs-shopping-cart mr-5"></i>Add{" "}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Deals1;
