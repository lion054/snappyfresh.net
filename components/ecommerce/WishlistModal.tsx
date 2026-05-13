import { Modal } from "react-responsive-modal";
import { useWishlist } from "../../hooks";
import { useCart } from "../../hooks";
import { getProductImageUrl } from "../../lib/imageProxy";

const WishlistModal = () => {
    // Use Context API hooks instead of Redux
    const {
        wishlist,
        wishlistModalOpen,
        clearWishlist,
        closeWishlistModal,
        removeFromWishlist
    } = useWishlist();

    const { addToCart } = useCart();

    const handleCart = (product: any) => {
        // Need to get UoM from product for cart
        const uom = product.uoMs && product.uoMs[0] || {
            uomEntry: product.defaultSalesUoMEntry,
            uomName: product.defaultSalesUoMName,
            price: product.price,
            inStock: product.UnitsOnStock || 0,
            currency: product.currency || 'USD',
            isPricingUOM: true,
            isInventoryOM: false,
            uomQuantity: 1,
            inventoryQuantityFactor: 1
        };

        addToCart(product, uom);
    };

    return (
        <>
            <Modal
                open={wishlistModalOpen}
                onClose={closeWishlistModal}
                center={true}
                classNames={{ modal: "full-modal" }}
            >
                {wishlist.length > 0 ? (
                    <div className="wishlist-cards">
                        {wishlist.map((product) => (
                            <div key={product.ItemCode} className="wishlist-card">
                                <img
                                    src={getProductImageUrl(product, '/assets/imgs/shop/product-1-1.jpg')}
                                    alt={product.ItemName}
                                    className="wishlist-card-img"
                                    width="70"
                                />
                                <div className="wishlist-card-info">
                                    <div className="wishlist-card-name">{product.ItemName}</div>
                                    <div className="wishlist-card-price">${product.price}</div>
                                </div>
                                <div className="wishlist-card-actions">
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleCart(product)}
                                    >
                                        Add To Cart
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => removeFromWishlist(product.ItemCode)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="wishlist-actions">
                            <button className="btn btn-warning clear-btn" onClick={clearWishlist}>
                                Clear All
                            </button>
                        </div>
                    </div>
                ) : (
                    <h4 className="mb-0">No Products</h4>
                )}
            </Modal>
        </>
    );
};

export default WishlistModal;
