
import Link from 'next/link';
import PerfectScrollbar from "react-perfect-scrollbar";
import { useCart } from "../../hooks";
import CartSidebarItem from '../CartSidebarItem';

const CartSidebar = () => {
    const {
        cart,
        isCartOpen,
        closeCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
    } = useCart();

    const price = () => {
        let totalPrice = 0;
        cart.forEach((item) => {
            const itemPrice = item.uom?.price || item.price || 0;
            totalPrice += itemPrice * item.quantity;
        });
        return totalPrice.toFixed(2);
    };

    return (
        <>
            <div
                className={`cart-sidebar cart ${
                    isCartOpen ? "cart_active" : ""
                }`}
                style={{width:"250px"}}
            >
                <div className="cart-sidebar-header">
                    <div className="cart-sidebar-item-count">
                        <span>
                            <i className="fas fa-shopping-bag"></i>
                        </span>
                        {cart.length > 0
                            ? `${cart.length} items`
                            : "No Products"}
                    </div>
                    <span className="close-cart-sidebar" onClick={closeCart}>
                        <i className="fas fa-times"></i>
                    </span>
                </div>
                <PerfectScrollbar>
                    <ul>
                        {cart.map((item, index) => (
                            <CartSidebarItem
                              key={index}
                              item={item}
                              index={index}
                              onIncrease={increaseQuantity}
                              onDecrease={decreaseQuantity}
                              onRemove={removeFromCart}
                            />
                        ))}
                    </ul>
                </PerfectScrollbar>

                {cart.length > 0 && (
                    <button className="clear-cart" onClick={clearCart}>
                        Clear all
                    </button>
                )}
                <Link href="/cart">
                    <div className="cart-popup-total">
                        <span>Continue</span>
                        <div className="amount">Total : ${price()}</div>
                    </div>
                </Link>
            </div>
        </>
    );
};

export default CartSidebar;
