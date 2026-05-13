
import Link from 'next/link';
import PerfectScrollbar from "react-perfect-scrollbar";
import { useCart } from "../../hooks";
import { PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

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
                        {cart.map((item, index) => {
                            const itemPrice = item.uom?.price || item.price || 0;
                            const itemName = item.itemName || item.name || "Product";
                            const itemImage = item.product?.images?.[0]?.img || item.image || PRODUCT_FALLBACK_IMAGE;

                            return (
                                <li key={index}>
                                    <div className="d-flex">
                                        <div className="flex-grow-1">
                                            <img
                                                src={itemImage}
                                                style={{
                                                    width: "75px",
                                                    height: "75px",
                                                }}
                                                className="align-self-center mr-2"
                                                alt="Product image"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                                                }}
                                            />
                                            <div>
                                                <h6 className="mb-0">
                                                    {itemName}
                                                </h6>
                                                <p className="mb-0">
                                                    <span>${itemPrice.toFixed(2)} </span> x
                                                    <span>{item.quantity}</span>
                                                </p>
                                                <div className="quantity-switch">
                                                    <span
                                                        onClick={() =>
                                                            decreaseQuantity(index)
                                                        }
                                                    >
                                                        <button>-</button>
                                                    </span>
                                                    <span
                                                        onClick={() =>
                                                            increaseQuantity(index)
                                                        }
                                                    >
                                                        <button>+</button>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="single-total">
                                            ${(item.quantity * itemPrice).toFixed(2)}
                                            <span
                                                className="ml-2"
                                                onClick={() =>
                                                    removeFromCart(index)
                                                }
                                            >
                                                <button>Delete</button>
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
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
