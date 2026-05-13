import { toast } from 'react-toastify';
import { useState } from "react";
import { useCart, useWishlist } from "../../hooks";
import ProductTab from "../elements/ProductTab";
import UpsellSlider from "../sliders/UpsellSlider";
import CrossSellSlider from "../sliders/CrossSellSlider";
import ThumbSlider from "../sliders/Thumb";
import { normalizeProductForCart, createDefaultUOM, isValidProduct, normalizeDisplayText } from "../../lib/productTransformer";
import { getWhatsAppShareUrl } from "../WhatsAppFab";
import { Product } from "../../types/models/product";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

interface ProductDetailsProps {
    product: Product;
    quickView?: boolean;
}

const ProductDetails = ({ product: rawProduct, quickView }: ProductDetailsProps) => {
    const [quantity, setQuantity] = useState(1);
    const [lightboxTrigger, setLightboxTrigger] = useState(0);

    // Use Context API hooks instead of Redux
    const { addToCart } = useCart();
    const { addToWishlist } = useWishlist();

    // Transform API product to component format
    const productImage = getProductImageUrl(rawProduct);
    const normalizedImages = Array.isArray(rawProduct?.images)
        ? rawProduct.images.map((item: any) => ({
            ...item,
            img: getProductImageUrl(item, productImage),
        }))
            .filter((item: any) => item.img)
        : [];
    const normalizedGallery = Array.isArray(rawProduct?.gallery)
        ? rawProduct.gallery.map((item: any) => ({
            ...item,
            thumb: getProductImageUrl(item, productImage),
        }))
            .filter((item: any) => item.thumb)
        : [];
    const product = {
        ...rawProduct,
        id: rawProduct?.id || rawProduct?.ItemCode || rawProduct?.itemCode,
        title: normalizeDisplayText(rawProduct?.title || rawProduct?.ItemName || rawProduct?.itemName || rawProduct?.name || ''),
        slug: rawProduct?.slug || rawProduct?.ItemCode || rawProduct?.itemCode,
        price: rawProduct?.price || 0,
        oldPrice: rawProduct?.oldPrice || null,
        desc: rawProduct?.desc || rawProduct?.description || rawProduct?.u_ONA_Description || rawProduct?.ItemName || rawProduct?.itemName || '',
        discount: rawProduct?.discount || { isActive: false, percentage: 0 },
        variations: rawProduct?.variations || [],
        stock: rawProduct?.stock || rawProduct?.UnitsOnStock || rawProduct?.unitsOnStock || 0,
        brand: rawProduct?.brand || rawProduct?.ItemsGroupName || rawProduct?.itemsGroupName || '',
        images: normalizedImages.length > 0 ? normalizedImages : (productImage ? [{ img: productImage }] : [{ img: PRODUCT_FALLBACK_IMAGE }]),
        gallery: normalizedGallery.length > 0 ? normalizedGallery : [
            { thumb: productImage },
            { thumb: productImage },
            { thumb: productImage }
        ]
    };

    const handleCart = (displayProduct: any) => {
        // Validate product
        if (!isValidProduct(displayProduct)) {
            toast.error("Invalid product data");
            return;
        }

        // Normalize product to ensure SAP field names for cart
        const normalizedProduct = normalizeProductForCart(displayProduct);

        // Get UOMs from product, or create a default one
        let uoms = normalizedProduct.uoMs || normalizedProduct.uoms || [];

        // If no UOMs, create a default one based on product price
        if (uoms.length === 0) {
            uoms = [createDefaultUOM(normalizedProduct)];
        }

        // Use the first UOM as default
        const selectedUOM = uoms[0];

        // Add the product with selected quantity
        for (let i = 0; i < quantity; i++) {
            addToCart(normalizedProduct, selectedUOM);
        }
    };

    const handleWishlist = (product: any) => {
        addToWishlist(product);
        toast("Added to Wishlist!");
    };

    // Guard against missing product data
    if (!rawProduct) {
        return (
            <div className="container mt-50 mb-50">
                <div className="alert alert-warning">Product not found</div>
            </div>
        );
    }

    return (
        <>
            <section className="mt-30 mb-30 product-detail-section">
                <div className="container">
                    <div className="row flex-row-reverse">
                        <div className="col-xl-10 col-lg-12 m-auto">
                            <div className="product-detail accordion-detail">
                                <div className="row mb-50 mt-30">
                                    <div className="col-md-6 col-sm-12 col-xs-12 mb-md-0 mb-sm-5">
                                        <div className="detail-gallery">
                                            <span
                                                className="zoom-icon"
                                                role="button"
                                                tabIndex={0}
                                                aria-label="Zoom product image"
                                                onClick={() => setLightboxTrigger((n) => n + 1)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setLightboxTrigger((n) => n + 1); }}
                                            >
                                                <i className="fi-rs-search"></i>
                                            </span>

                                            <div className="product-image-slider">
                                                <ThumbSlider product={product} lightboxTrigger={lightboxTrigger} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6 col-sm-12 col-xs-12">
                                        <div className="detail-info detail-info-mobile">
                                            <span className="stock-status out-stock"> Sale Off </span>
                                            <h2 className="title-detail">{product.title}</h2>
                                            <div className="clearfix product-price-cover">
                                                <div className="product-price primary-color float-left">
                                                    <span className="current-price text-brand">${typeof product.price === 'number' ? product.price.toFixed(2) : product.price}</span>
                                                    <span>
                                                        {product.discount?.isActive && product.discount?.percentage > 0 && (
                                                            <span className="save-price font-md color3 ml-15">{product.discount.percentage}% Off</span>
                                                        )}
                                                        {product.oldPrice && (
                                                            <span className="old-price font-md ml-15">$ {product.oldPrice.toFixed(2)}</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="short-desc mb-30">
                                                <p className="font-lg">{product.desc}</p>
                                            </div>
                                            {product.variations && product.variations.length > 0 && (
                                                <div className="attr-detail attr-color mb-15">
                                                    <strong className="mr-10">Color</strong>
                                                    <ul className="list-filter color-filter">
                                                        {product.variations.map((clr, i) => (
                                                            <li key={i}>
                                                                <a href="#">
                                                                    <span className={`product-color-${clr}`}></span>
                                                                </a>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            <div className="bt-1 border-color-1 mt-30 mb-30"></div>
                                            <div className="detail-extralink">
                                                <div className="detail-qty border radius">
                                                    <a onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)} className="qty-down">
                                                        <i className="fi-rs-angle-small-down"></i>
                                                    </a>
                                                    <span className="qty-val">{quantity}</span>
                                                    <a onClick={() => setQuantity(quantity + 1)} className="qty-up">
                                                        <i className="fi-rs-angle-small-up"></i>
                                                    </a>
                                                </div>
                                                <div className="product-extra-link2">
                                                    <button
                                                        onClick={() =>
                                                            handleCart({
                                                                ...product,
                                                                quantity: quantity || 1
                                                            })
                                                        }
                                                        className="button button-add-to-cart"
                                                    >
                                                        Add to cart
                                                    </button>
                                                    <a aria-label="Add To Wishlist" className="action-btn hover-up" onClick={() => handleWishlist(product)}>
                                                        <i className="fi-rs-heart"></i>
                                                    </a>
                                                    <a
                                                        aria-label="Share on WhatsApp"
                                                        className="action-btn hover-up"
                                                        href={getWhatsAppShareUrl(product.title, typeof window !== 'undefined' ? window.location.href : '')}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ backgroundColor: "#25D366", color: "white" }}
                                                    >
                                                        <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                            <ul className="product-meta font-xs color-grey mt-30">
                                                <li className="mb-5">
                                                    SKU:
                                                    <a href="#">{product.ItemCode || product.id || 'N/A'}</a>
                                                </li>
                                                {product.brand && (
                                                    <li className="mb-5">
                                                        Tags:
                                                        <a href="#" rel="tag" className="me-1">
                                                            {normalizeDisplayText(product.brand)}
                                                        </a>
                                                    </li>
                                                )}
                                                <li>
                                                    Availability:
                                                    <span className="in-stock text-success ml-5">{product.stock} Items In Stock</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {quickView ? null : (
                                    <>
                                        <ProductTab />
                                        <UpsellSlider currentProduct={rawProduct} />
                                        <CrossSellSlider currentProduct={rawProduct} cartItems={[]} />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProductDetails;
