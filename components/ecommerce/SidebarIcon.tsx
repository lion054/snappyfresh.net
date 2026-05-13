import { useCart } from "../../hooks";
import { useWishlist } from "../../hooks";

const SideBarIcons = () => {
    const { cart, openCart } = useCart();
    const { wishlist, openWishlistModal } = useWishlist();

    const totalCartItems = cart.length;
    const totalWishlistItems = wishlist.length;
    return (
        <>
            <div className="right-sidebar-popup-btn">
                <div className="popup-btn cart" onClick={openCart}>
                    Cart
                    <span> {totalCartItems}</span>
                </div>
                <div className="popup-btn wishlist" onClick={openWishlistModal}>
                    Wishlist
                    <span> {totalWishlistItems}</span>
                </div>
            </div>
        </>
    );
};

export default SideBarIcons;
