import { FC } from "react";
import Link from 'next/link';
import { useCart } from "../contexts/CartContext";
import { getProductImageUrl } from "../lib/imageProxy";
import ProductImage from "./common/ProductImage";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartDrawer: FC<CartDrawerProps> = ({ isOpen, onClose }) => {
    // Use Context API hook instead of Redux
    const { cart, cartTotal, incrementItem, decrementItem, removeFromCart } = useCart();

    const subtotal = cartTotal;
    // Calculate savings based on oldPrice if available
    const savings = cart.reduce((total: number, item: any) => {
        const currentPrice = item.uom?.price || 0;
        const oldPrice = item.product?.oldPrice || currentPrice;
        const saving = oldPrice - currentPrice;
        return total + (saving > 0 ? saving * item.quantity : 0);
    }, 0);
    const total = subtotal;

    // Calculate VAT from cart items' salesVATRate
    const vatAmount = cart.reduce((acc, item) => {
        const price = item.uom?.price || 0;
        const rate = item.salesVATRate || 0;
        const vat = rate > 0 ? price - (price / (1 + rate / 100)) : 0;
        return acc + (vat * item.quantity);
    }, 0);

    return (
        <>
            <style>{`
                .cart-drawer-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.4);
                    backdrop-filter: blur(5px);
                    z-index: var(--z-drawer-backdrop, 1000);
                    opacity: ${isOpen ? 1 : 0};
                    visibility: ${isOpen ? 'visible' : 'hidden'};
                    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .cart-drawer-content {
                    position: fixed;
                    top: 0;
                    right: 0;
                    width: 450px;
                    height: 100vh;
                    background: #fff;
                    box-shadow: -6px 0 30px rgba(0, 0, 0, 0.2);
                    z-index: var(--z-drawer, 1010);
                    display: flex;
                    flex-direction: column;
                    transform: translateX(${isOpen ? '0' : '100%'});
                    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                }

                @media (max-width: 640px) {
                    .cart-drawer-content {
                        width: 100%;
                    }
                }

                .cart-drawer-header {
                    padding: 22px 24px;
                    border-bottom: 1px solid #f0f0f0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: linear-gradient(135deg, #fafbfc 0%, #fff 100%);
                }

                .cart-drawer-header h2 {
                    font-size: 22px;
                    font-weight: 800;
                    color: #1a1a1a;
                    margin: 0;
                }

                .cart-drawer-close {
                    background: none;
                    border: none;
                    font-size: 28px;
                    color: #636363;
                    cursor: pointer;
                    padding: 0;
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.25s ease;
                    border-radius: 50%;
                }

                .cart-drawer-close:hover {
                    background: #f0f0f0;
                    color: #333;
                }

                .cart-drawer-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .cart-drawer-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    text-align: center;
                }

                .cart-drawer-empty h3 {
                    color: #253d4e;
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }

                .cart-drawer-empty p {
                    color: #7e7e7e;
                    font-size: 14px;
                    margin: 0;
                }

                .cart-item {
                    display: flex;
                    gap: 14px;
                    padding: 18px 0;
                    border-bottom: 1px solid #f5f5f5;
                    animation: slideIn 0.3s ease;
                }

                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                .cart-item:last-child {
                    border-bottom: none;
                }

                .cart-item-image {
                    width: 90px;
                    height: 90px;
                    border-radius: 10px;
                    overflow: hidden;
                    background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
                    border: 1px solid #efefef;
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .cart-item-image img {
                    width: 85%;
                    height: 85%;
                    object-fit: contain;
                }

                .cart-item-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }

                .cart-item-name {
                    font-size: 13px;
                    font-weight: 700;
                    color: #222;
                    margin: 0;
                    line-height: 1.3;
                }

                .cart-item-price {
                    font-size: 14px;
                    font-weight: 800;
                    color: #e74c3c;
                }

                .cart-item-save {
                    font-size: 11px;
                    color: #27ae60;
                    font-weight: 600;
                }

                .cart-item-quantity {
                    display: flex;
                    align-items: center;
                    gap: 0;
                    border: 1px solid #e8e8e8;
                    border-radius: 6px;
                    width: fit-content;
                    background: #fafbfc;
                }

                .qty-btn {
                    background: none;
                    border: none;
                    padding: 6px 12px;
                    min-width: 36px;
                    min-height: 36px;
                    cursor: pointer;
                    color: #636363;
                    font-size: 15px;
                    font-weight: 600;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qty-btn:hover {
                    color: #2d7c4a;
                    background: #f0f0f0;
                }

                .qty-value {
                    padding: 0 6px;
                    font-weight: 700;
                    font-size: 13px;
                    color: #222;
                    min-width: 20px;
                    text-align: center;
                }

                .cart-item-delete {
                    padding: 0;
                    background: none;
                    border: none;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: flex-start;
                }

                .cart-item-delete:hover {
                    color: #e74c3c;
                    transform: scale(1.15);
                }

                .cart-drawer-footer {
                    padding: 26px 24px;
                    border-top: 1px solid #f0f0f0;
                    background: linear-gradient(180deg, #fafbfc 0%, #fff 100%);
                }

                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 14px;
                    font-size: 13px;
                }

                .summary-label {
                    color: #888;
                    font-weight: 600;
                }

                .summary-value {
                    font-weight: 800;
                    color: #222;
                }

                .summary-saving {
                    background: linear-gradient(135deg, #e8f5f0 0%, #d4f0e8 100%);
                    padding: 14px 16px;
                    border-radius: 10px;
                    text-align: center;
                    margin-bottom: 16px;
                    border: 1px solid #c8e6dc;
                }

                .summary-saving-text {
                    font-size: 11px;
                    color: #27ae60;
                    margin-bottom: 5px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .summary-saving-amount {
                    font-size: 18px;
                    font-weight: 800;
                    color: #27ae60;
                }

                .summary-total {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 14px;
                    border-top: 1px solid #e8e8e8;
                    margin-bottom: 22px;
                }

                .total-label {
                    font-size: 15px;
                    font-weight: 800;
                    color: #222;
                }

                .total-amount {
                    font-size: 22px;
                    font-weight: 800;
                    color: #e74c3c;
                }

                .drawer-button {
                    width: 100%;
                    padding: 14px 16px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    text-decoration: none;
                    display: block;
                    text-align: center;
                    line-height: 1;
                }

                .btn-checkout {
                    background: linear-gradient(135deg, #2d7c4a 0%, #245a39 100%);
                    color: white;
                    margin-bottom: 12px;
                    box-shadow: 0 4px 14px rgba(45, 124, 74, 0.3);
                    font-weight: 800;
                    letter-spacing: 0.3px;
                }

                .btn-checkout:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 20px rgba(45, 124, 74, 0.4);
                }

                .btn-checkout:active {
                    transform: translateY(0);
                }

                .btn-continue {
                    background: white;
                    color: #2d7c4a;
                    border: 2px solid #2d7c4a;
                    font-weight: 700;
                }

                .btn-continue:hover {
                    background: #f8f9fa;
                }
            `}</style>

            {/* Overlay */}
            <div
                className="cart-drawer-overlay"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="cart-drawer-content" role="dialog" aria-modal="true" aria-label="Shopping cart">
                {/* Header */}
                <div className="cart-drawer-header">
                    <h2>My Basket <span className="sr-only" aria-live="polite" aria-atomic="true">({cart.length} {cart.length === 1 ? 'item' : 'items'})</span></h2>
                    <button className="cart-drawer-close" onClick={onClose} aria-label="Close cart">×</button>
                </div>

                {/* Body */}
                <div className="cart-drawer-body">
                    {cart.length === 0 ? (
                        <div className="cart-drawer-empty">
                            <h3>Your basket is empty</h3>
                            <p>Add items to get started</p>
                        </div>
                    ) : (
                        cart.map((item: any, index) => {
                            const product = item.product || {};
                            const itemPrice = item.uom?.price || 0;
                            const oldPrice = (product as any).oldPrice || itemPrice;
                            const itemSaving = oldPrice - itemPrice;
                            const itemImage = getProductImageUrl(product);

                            return (
                                <div key={`${item.itemCode}-${index}`} className="cart-item">
                                    <ProductImage src={itemImage} alt={item.itemName} context="thumb" style={{ width: 80, height: 80, objectFit: 'contain' }} />
                                    <div className="cart-item-details">
                                        <h3 className="cart-item-name">{item.itemName}</h3>
                                        <div className="cart-item-price">${itemPrice.toFixed(2)} {item.uom?.uomName && `/ ${item.uom.uomName}`}</div>
                                        {itemSaving > 0 && (
                                            <div className="cart-item-save">Save ${(itemSaving * item.quantity).toFixed(2)}</div>
                                        )}
                                        <div className="cart-item-quantity">
                                            <button
                                                className="qty-btn"
                                                onClick={() => decrementItem(index)}
                                                aria-label={"Decrease quantity of " + item.itemName}
                                            >
                                                −
                                            </button>
                                            <span className="qty-value" aria-label={"Quantity: " + item.quantity}>{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => incrementItem(index)}
                                                aria-label={"Increase quantity of " + item.itemName}
                                            >
                                                +
                                            </button>
                                        </div>
                                        {product.UnitsOnStock != null && product.UnitsOnStock < 10 && product.UnitsOnStock > 0 && (
                                            <span className="stock-limit-hint">Only {product.UnitsOnStock} left</span>
                                        )}
                                    </div>
                                    <button
                                        className="cart-item-delete"
                                        onClick={() => {
                                            if (window.confirm(`Remove "${item.itemName}" from cart?`)) {
                                                removeFromCart(index);
                                            }
                                        }}
                                        aria-label={`Remove ${item.itemName} from cart`}
                                    >
                                        🗑
                                    </button>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                    <div className="cart-drawer-footer">
                        <div className="summary-row">
                            <span className="summary-label">Subtotal</span>
                            <span className="summary-value">${subtotal.toFixed(2)}</span>
                        </div>

                        {savings > 0 && (
                            <div className="summary-saving">
                                <div className="summary-saving-text">You're Saving</div>
                                <div className="summary-saving-amount">${savings.toFixed(2)}</div>
                            </div>
                        )}

                        {vatAmount > 0 && (
                            <div className="summary-row" style={{ fontSize: '13px', color: '#666' }}>
                                <span className="summary-label">Tax (VAT incl.)</span>
                                <span className="summary-value">${vatAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="summary-total">
                            <span className="total-label">Total:</span>
                            <span className="total-amount">${total.toFixed(2)}</span>
                        </div>

                        <Link href="/checkout" onClick={onClose} className="drawer-button btn-checkout">
                            Proceed to Checkout →
                        </Link>
                        <button className="drawer-button btn-continue" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CartDrawer;
