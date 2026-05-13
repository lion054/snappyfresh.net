import { toast } from 'react-toastify';
import { useEffect, useState, memo, FC } from 'react';
import Link from 'next/link';
import { useCart } from "../../hooks";
import { normalizeProductForCart, createDefaultUOM, isValidProduct, normalizeDisplayText } from "../../lib/productTransformer";
import { getProductImageUrl, PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";
import ProductImage from '../common/ProductImage';

interface Sixty60ProductCardProps {
    product: any;
    /** Index position in the grid — first 6 cards get eager loading for LCP */
    index?: number;
}

const CURRENCY_SYMBOLS: Record<string, string> = {
    USD: "$",
    ZAR: "R",
    ZWL: "$",
    EUR: "€",
    GBP: "£",
};

const Sixty60ProductCard: FC<Sixty60ProductCardProps> = ({ product, index }) => {
    const { addToCart } = useCart();
    const [added, setAdded] = useState(false);

    const handleCart = (rawProduct: any) => {
        // Validate product
        if (!isValidProduct(rawProduct)) {
            toast.error("Invalid product data");
            return;
        }

        // Normalize product to ensure SAP field names
        const normalizedProduct = normalizeProductForCart(rawProduct);

        // Get UOMs from product, or create a default one
        let uoms = normalizedProduct.uoMs || normalizedProduct.uoms || [];

        // If no UOMs, create a default one based on product price
        if (uoms.length === 0) {
            uoms = [createDefaultUOM(normalizedProduct)];
        }

        // Use the first UOM as default
        const selectedUOM = uoms[0];

        addToCart(normalizedProduct, selectedUOM);
        setAdded(true);
        setTimeout(() => setAdded(false), 1200);
    };

    // Transform API product to component format (same logic as SingleProduct)
    const productSlug = product.slug || product.ItemCode || product.itemCode || product.id;
    const rawTitle = product.title || product.ItemName || product.itemName || product.name;
    const productTitle = normalizeDisplayText(rawTitle);
    const productPrice = product.price || 0;
    const rawBrand = product.brand || product.ItemsGroupName || product.itemsGroupName || '';
    const productBrand = normalizeDisplayText(rawBrand);

    const productImage = getProductImageUrl(product);
    const [imageSrc, setImageSrc] = useState(productImage || PRODUCT_FALLBACK_IMAGE);
    const productDiscount = product.discount || {};
    const oldPrice = product.oldPrice || productDiscount.oldPrice || null;
    const stockCount = product.unitsOnStock || product.UnitsOnStock || 0;
    const isOutOfStock = stockCount <= 0;
    const dollars = Math.floor(productPrice);
    const cents = (productPrice % 1).toFixed(2).substring(2);
    const currencyCode = String(product.currency || 'USD').toUpperCase();
    const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || product.currencySymbol || "$";
    const lowStock = stockCount > 0 && stockCount < 10;
    const showSavings = !!oldPrice && oldPrice > productPrice;
    const savingsAmount = showSavings ? Math.round((oldPrice - productPrice) * 100) / 100 : 0;
    const savingsLabel = Number.isInteger(savingsAmount)
        ? `${currencySymbol}${savingsAmount.toFixed(0)}`
        : `${currencySymbol}${savingsAmount.toFixed(2)}`;

    useEffect(() => {
        setImageSrc(productImage || PRODUCT_FALLBACK_IMAGE);
    }, [productImage]);

    return (
        <article className="sf-pcard" aria-label={productTitle}>
            {!isOutOfStock && (
                <button
                    type="button"
                    className={`sf-pcard-cart ${added ? 'added' : ''}`}
                    onClick={() => handleCart(product)}
                    aria-label={added ? `${productTitle} added to cart` : `Add ${productTitle} to cart`}
                >
                    {added ? (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Added</span>
                        </>
                    ) : (
                        <>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            <span>Add</span>
                        </>
                    )}
                </button>
            )}

            <Link href="/product/[slug]" as={`/product/${productSlug}`} className="sf-pcard-link">
                <div className="sf-pcard-img-wrap">
                    <div className="sf-pcard-img-inner">
                        <ProductImage
                            className="sf-pcard-img"
                            src={imageSrc}
                            alt={productTitle}
                            fallbackSrc={PRODUCT_FALLBACK_IMAGE}
                            context="card"
                            eager={typeof index === 'number' && index < 6}
                            onError={() => setImageSrc(PRODUCT_FALLBACK_IMAGE)}
                        />
                    </div>

                    {/* Badges */}
                    <div className="sf-pcard-badges">
                        {showSavings && (
                            <span className="sf-pcard-badge sale">SAVE {savingsLabel}</span>
                        )}
                        {lowStock && <span className="sf-pcard-badge low">Only {stockCount} left</span>}
                    </div>

                    {/* Out of stock overlay */}
                    {isOutOfStock && (
                        <div className="sf-pcard-oos">
                            <span>Out of stock</span>
                        </div>
                    )}
                </div>

                <div className="sf-pcard-body">
                    {productBrand && <span className="sf-pcard-brand">{productBrand}</span>}
                    <h3 className="sf-pcard-title">{productTitle}</h3>
                    <div className="sf-pcard-price-row">
                        <div className="sf-pcard-price">
                            <span className="sf-pcard-dollar">{currencySymbol}</span>
                            <span className="sf-pcard-amount">{dollars}</span>
                            <span className="sf-pcard-cents">.{cents}</span>
                        </div>
                        {showSavings && (
                            <span className="sf-pcard-old">{currencySymbol}{oldPrice.toFixed(2)}</span>
                        )}
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default memo(Sixty60ProductCard);
