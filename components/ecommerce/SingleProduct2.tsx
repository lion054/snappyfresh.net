import { toast } from 'react-toastify';
import { FC } from "react";
import Link from 'next/link';
import { useCart, useWishlist, useQuickView } from "../../hooks";
import { normalizeProductForCart, createDefaultUOM, normalizeDisplayText } from "../../lib/productTransformer";
import { logger } from "../../lib/logger";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";
import ProductImage from "../common/ProductImage";

interface SingleProduct2Props {
    product: any;
}

const SingleProduct2: FC<SingleProduct2Props> = ({ product }) => {
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
    const rawTitle = product.title || product.itemName || product.name;
    const productTitle = normalizeDisplayText(rawTitle);
    const productPrice = product.price || 0;
    const rawBrand = product.brand || product.itemsGroupName || '';
    const productBrand = normalizeDisplayText(rawBrand);
    const productImage = getProductImageUrl(product);
    const hoverImage = getProductImageUrl(
        Array.isArray(product.images) && product.images[1]
            ? { image: product.images[1] }
            : product,
        productImage || PRODUCT_FALLBACK_IMAGE
    );
    const productDiscount = product.discount || {};
    const unitLabel = product.desc || (product.defaultSalesUoMName ? `Per ${product.defaultSalesUoMName}` : '');

    return (
        <>
            <div className="product-cart-wrap mb-30">
                <div className="product-img-action-wrap">
                    <div className="product-img product-img-zoom">
                        <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                            <ProductImage
                                className="default-img"
                                src={productImage}
                                alt={productTitle}
                                eager={false}
                                width={300}
                                height={300}
                                style={{ objectFit: 'contain', backgroundColor: '#f8f9fa' }}
                                fallbackSrc={PRODUCT_FALLBACK_IMAGE}
                            />
                            <ProductImage
                                className="hover-img"
                                src={hoverImage}
                                alt={productTitle}
                                width={300}
                                height={300}
                                style={{ objectFit: 'contain' }}
                                fallbackSrc={productImage}
                            />
                        </Link>
                    </div>
                    <div className="product-action-1">
                        <a
                            aria-label="Quick view"
                            className="action-btn hover-up"
                            data-bs-toggle="modal"
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
                    {productBrand && (
                        <div className="product-category">
                            <Link href="/store">{productBrand}</Link>
                        </div>
                    )}
                    <h2>
                        <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                            {productTitle}
                        </Link>
                    </h2>

                    <div className="product-card-bottom">
                        <div className="product-price">
                            <span>${productPrice.toFixed(2)}</span>
                            {product.oldPrice && <span className="old-price">${product.oldPrice.toFixed(2)}</span>}
                        </div>
                        {unitLabel && (
                            <div className="product-unit-label">
                                {unitLabel}
                            </div>
                        )}
                        <div className="add-cart">
                            <a className="add" onClick={() => handleCart(product)}>
                                <i className="fi-rs-shopping-cart mr-5"></i>
                                <span className="add-cart-text">Add</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SingleProduct2;
