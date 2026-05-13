import { toast } from 'react-toastify';
import { FC } from "react";
import Link from 'next/link';
import { useCart, useWishlist, useQuickView } from "../../hooks";
import { normalizeProductForCart, createDefaultUOM } from "../../lib/productTransformer";
import { logger } from "../../lib/logger";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";
import ProductImage from "../common/ProductImage";

interface SingleProductListProps {
    product: any;
}

const SingleProductList: FC<SingleProductListProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();
    const { openQuickView } = useQuickView();

    const handleCart = (product: any) => {
        try {
            const normalizedProduct = normalizeProductForCart(product);
            let uoms = normalizedProduct.uoMs || normalizedProduct.uoms || [];
            if (uoms.length === 0) {
                uoms = [createDefaultUOM(normalizedProduct)];
            }
            const selectedUOM = uoms[0];
            addToCart(normalizedProduct, selectedUOM);
        } catch (error) {
            logger.error("Error adding product to cart:", error);
            toast.error("Failed to add product to cart");
        }
    };

    const handleWishlist = (product: any) => {
        try {
            addToWishlist(product);
            toast("Added to Wishlist !");
        } catch (error) {
            logger.error("Error adding product to wishlist:", error);
            toast.error("Failed to add to wishlist");
        }
    };

    // Transform API product to component format
    const productSlug = product.slug || product.itemCode || product.id;
    const productTitle = product.title || product.itemName || product.name;
    const productPrice = product.price || 0;
    const productBrand = product.brand || product.itemsGroupName || 'Product';
    const productImage = getProductImageUrl(product, PRODUCT_FALLBACK_IMAGE);
    const hoverImage = getProductImageUrl(
        Array.isArray(product.images) && product.images[1]
            ? { image: product.images[1] }
            : product,
        productImage
    );
    const productDiscount = product.discount || {};

    return (
        <>
            <div className="product-list mb-30">
                <div className="product-cart-wrap">
                    <div className="product-img-action-wrap">
                        <div className="product-img product-img-zoom">
                            <div className="product-img-inner">
                                <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                                    <ProductImage
                                        className="default-img"
                                        src={productImage}
                                        alt={productTitle}
                                        fallbackSrc={PRODUCT_FALLBACK_IMAGE}
                                    />
                                    <ProductImage
                                        className="hover-img"
                                        src={hoverImage}
                                        alt={productTitle}
                                        fallbackSrc={productImage}
                                    />
                                </Link>
                            </div>
                        </div>
                        <div className="product-action-1">
                            <a
                                aria-label="Quick view"
                                className="action-btn hover-up"
                                data-bs-toggle="modal"
                                // data-bs-target="#quickViewModal"
                                onClick={() => openQuickView(product)}
                            >
                                <i className="fi-rs-eye"></i>
                            </a>
                            <a aria-label="Add To Wishlist" className="action-btn hover-up" onClick={() => handleWishlist(product)}>
                                <i className="fi-rs-heart"></i>
                            </a>
                        </div>

                        <div className="product-badges product-badges-position product-badges-mrg">
                            {product.trending && <span className="hot">Hot</span>}
                            {product.created && <span className="new">New</span>}
                            {product.totalSell > 100 && <span className="best">Best Sell</span>}
                            {productDiscount.isActive && <span className="sale">Sale</span>}
                            {productDiscount.percentage >= 5 && <span className="hot">{productDiscount.percentage}%</span>}
                        </div>
                    </div>
                    <div className="product-content-wrap">
                        <div className="product-category">
                            <Link href="/store">{productBrand}</Link>
                        </div>
                        <h2>
                            <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                                {productTitle}
                            </Link>
                        </h2>

                        <div className="product-price mt-15 mb-15">
                            <span>${productPrice.toFixed(2)} </span>
                            {product.oldPrice && <span className="old-price">$ {product.oldPrice.toFixed(2)}</span>}
                        </div>

                        {(product.desc || product.defaultSalesUoMName) && (
                            <p className="mt-15" style={{ fontSize: "13px", color: "#42af57", fontWeight: "500" }}>
                                <i className="fi-rs-clock" style={{ marginRight: "6px" }}></i>
                                {product.desc || `Per ${product.defaultSalesUoMName}`}
                            </p>
                        )}

                        <div className="mt-30 d-flex align-items-center">
                            <a aria-label="Add To Cart" className="btn" onClick={() => handleCart(product)}>
                                <i className="fi-rs-shopping-bag-add"></i>
                                Add to Cart
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SingleProductList;
