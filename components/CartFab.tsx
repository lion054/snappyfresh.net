import { useEffect, useRef, useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useCartDrawer } from '../contexts/CartDrawerContext';

const CartFab = () => {
    const { cartItemCount } = useCart();
    const { openCartDrawer } = useCartDrawer();
    const [bounce, setBounce] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const fabRef = useRef<HTMLButtonElement>(null);
    const prevCount = useRef(cartItemCount);

    // Load saved position from localStorage (default to bottom-right)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const saved = localStorage.getItem('cartFabPos');
        if (saved) {
            try {
                setPos(JSON.parse(saved));
            } catch (e) {
                setPos({ x: window.innerWidth - 76, y: window.innerHeight - 76 });
            }
        } else {
            setPos({ x: window.innerWidth - 76, y: window.innerHeight - 76 });
        }
    }, []);

    // Trigger bounce animation when item count increases
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (cartItemCount > prevCount.current) {
            setBounce(true);
            timer = setTimeout(() => setBounce(false), 600);
        }
        prevCount.current = cartItemCount;
        return () => { if (timer) clearTimeout(timer); };
    }, [cartItemCount]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return; // Only left mouse button
        setIsDragging(true);
        const rect = fabRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    useEffect(() => {
        if (!isDragging) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (!fabRef.current) return;
            const newX = e.clientX - dragOffset.x;
            const newY = e.clientY - dragOffset.y;
            setPos({ x: newX, y: newY });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            localStorage.setItem('cartFabPos', JSON.stringify(pos));
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragOffset, pos]);

    // Don't show FAB when cart is empty
    if (cartItemCount === 0) return null;

    return (
        <>
            <style>{`
                .cart-fab {
                    position: fixed;
                    z-index: var(--z-fab, 600);
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    border: none;
                    background: linear-gradient(135deg, #1a5c38 0%, #236b43 100%);
                    color: white;
                    cursor: grab;
                    box-shadow: 0 4px 16px rgba(26, 92, 56, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                    touch-action: none;
                }

                .cart-fab.dragging {
                    cursor: grabbing;
                    box-shadow: 0 8px 24px rgba(26, 92, 56, 0.6);
                }

                .cart-fab:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 24px rgba(26, 92, 56, 0.5);
                }

                .cart-fab:active {
                    transform: scale(0.95);
                }

                .cart-fab.bounce {
                    animation: fabBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                @keyframes fabBounce {
                    0% { transform: scale(1); }
                    20% { transform: scale(1.25); }
                    40% { transform: scale(0.9); }
                    60% { transform: scale(1.12); }
                    80% { transform: scale(0.97); }
                    100% { transform: scale(1); }
                }

                .cart-fab-icon {
                    width: 26px;
                    height: 26px;
                    position: relative;
                }

                .cart-fab-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    min-width: 22px;
                    height: 22px;
                    border-radius: 11px;
                    background: #ff4757;
                    color: white;
                    font-size: 11px;
                    font-weight: 800;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0 5px;
                    box-shadow: 0 2px 6px rgba(255, 71, 87, 0.4);
                    border: 2px solid white;
                }

                @media (max-width: 640px) {
                    .cart-fab {
                        bottom: 16px;
                        right: 16px;
                        width: 54px;
                        height: 54px;
                    }
                    .cart-fab-icon {
                        width: 22px;
                        height: 22px;
                    }
                }
            `}</style>

            <button
                ref={fabRef}
                className={`cart-fab${bounce ? ' bounce' : ''}${isDragging ? ' dragging' : ''}`}
                onClick={openCartDrawer}
                onMouseDown={handleMouseDown}
                style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: isDragging ? 'scale(1.05)' : undefined,
                }}
                aria-label={`View cart (${cartItemCount} items)`}
            >
                <svg className="cart-fab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span className="cart-fab-badge">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
            </button>
        </>
    );
};

export default CartFab;
