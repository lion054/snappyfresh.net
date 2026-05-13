import Link from 'next/link';
import { toast } from 'react-toastify';
import { useCart } from "../../hooks";
import { normalizeProductForCart, createDefaultUOM } from "../../lib/productTransformer";
import { logger } from "../../lib/logger";
import { Product } from "../../types/models/product";
import { PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

interface CompareTableProps {
  data: Product[];
  features: string[];
  deleteFromCompare: (productId: string) => void;
}

const CompareTable = ({ data, features, deleteFromCompare }: CompareTableProps) => {
    const { addToCart } = useCart();

    const handleCart = (product: Product) => {
        try {
            const normalizedProduct = normalizeProductForCart(product);
            const defaultUoM = createDefaultUOM(normalizedProduct);
            addToCart(normalizedProduct, defaultUoM);
        } catch (error) {
            logger.error("Error adding product to cart:", error);
            toast.error("Failed to add product to cart");
        }
    };
    return (
        <div className="compare-cards">
            {data.map((product) => (
                <div key={product.id} className="compare-card">
                    {/* Product image */}
                    {features.includes("preview") && (
                        <div className="compare-card-preview">
                            <img
                                src={product.images?.[0]?.img || product.image || PRODUCT_FALLBACK_IMAGE}
                                alt={product.title}
                                className="compare-card-img"
                            />
                        </div>
                    )}

                    {/* Product name */}
                    {features.includes("name") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Product</span>
                            <h5 className="compare-card-name">
                                <a href="#">{product.title}</a>
                            </h5>
                        </div>
                    )}

                    {/* Price */}
                    {features.includes("price") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Price</span>
                            <span className="compare-card-price">${product.price}</span>
                        </div>
                    )}

                    {/* Rating */}
                    {features.includes("rating") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Rating</span>
                            {(product.review ?? 0) >= 0 && (
                                <div className="rating_wrap">
                                    <div className="product-rate d-inline-block">
                                        <div
                                            className="product-rating"
                                            style={{ width: `${product.ratingScore}%` }}
                                        ></div>
                                    </div>
                                    <span className="rating_num">({product.review})</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Description */}
                    {features.includes("description") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Description</span>
                            <p className="compare-card-desc">{product.desc}</p>
                        </div>
                    )}

                    {/* Stock */}
                    {features.includes("stock") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Stock</span>
                            {(product.stock ?? 0) >= 0 ? (
                                <span className="compare-card-stock-in">In Stock</span>
                            ) : (
                                <span className="compare-card-stock-out">Out of stock</span>
                            )}
                        </div>
                    )}

                    {/* Weight */}
                    {features.includes("weight") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Weight</span>
                            <span>{product.weight} gram</span>
                        </div>
                    )}

                    {/* Dimensions */}
                    {features.includes("dimensions") && (
                        <div className="compare-card-field">
                            <span className="compare-card-label">Dimensions</span>
                            <span>N/A</span>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="compare-card-actions">
                        {features.includes("buy") && (
                            <>
                                {(product.stock ?? 0) >= 0 ? (
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleCart(product)}
                                    >
                                        <i className="fi-rs-shopping-bag mr-5"></i>
                                        Add to cart
                                    </button>
                                ) : (
                                    <Link href="/contact-us">
                                        <button type="button" className="btn btn-sm btn-secondary">
                                            <i className="fi-rs-headset mr-5"></i>
                                            Contact Us
                                        </button>
                                    </Link>
                                )}
                            </>
                        )}

                        {features.includes(" ") && (
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                    deleteFromCompare(product.id || product.ItemCode)
                                }
                            >
                                <i className="fi-rs-trash mr-5"></i>
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CompareTable;
