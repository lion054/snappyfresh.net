import { useState, useEffect } from "react";
import Link from 'next/link';
import { useProducts } from "../../hooks";
import { PRODUCT_FALLBACK_IMAGE } from "../../lib/imageProxy";

const IntroPopup = () => {
    const { products: allProducts, isReady } = useProducts();
    const [openClass, setOpenClass] = useState(1);
    const [product, setProduct] = useState<any>(null);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile device
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem('hasSeenFeaturedPopup');
        if (hasSeenPopup) return;

        // OPTION: Hide popup completely on mobile
        // Uncomment the next 2 lines to disable popup on mobile devices
        // if (isMobile) return;

        if (isReady && allProducts.length > 0 && !product) {
            const randomIndex = Math.floor(Math.random() * allProducts.length);
            setProduct(allProducts[randomIndex]);

            setTimeout(() => {
                setOpenClass(0);
                sessionStorage.setItem('hasSeenFeaturedPopup', 'true');
            }, 1500);
        }
    }, [isReady, allProducts, isMobile]);

    const handleRemove = () => {
        setOpenClass(openClass ? 0 : 1);
    };

    const productSlug = product?.slug || product?.itemCode || product?.id;
    const productTitle = product?.title || product?.itemName || product?.name || 'Featured Product';
    const productPrice = product?.price || 0;
    const productDiscount = product?.discount || {};
    const productImage = product?.image || (product?.images && product?.images[0]?.img) || PRODUCT_FALLBACK_IMAGE;

    return (
        <>
            <div className={openClass ? "modal fade custom-modal d-none" : "modal fade custom-modal show d-block"}>
                <div className="modal-dialog" style={{
                    maxWidth: isMobile ? '95%' : '800px',
                    margin: isMobile ? '10px auto' : '1.75rem auto'
                }}>
                    <div className="modal-content" style={{
                        borderRadius: isMobile ? '12px' : '15px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={handleRemove}
                            style={{
                                position: 'absolute',
                                top: isMobile ? '8px' : '15px',
                                right: isMobile ? '8px' : '15px',
                                zIndex: 10
                            }}
                        ></button>
                        <div className="modal-body" style={{
                            padding: isMobile ? '15px' : '20px'
                        }}>
                            {!product ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{
                                    position: 'relative',
                                    padding: isMobile ? '20px 15px' : '40px',
                                    background: 'linear-gradient(135deg, rgba(248, 249, 250, 0.8) 0%, rgba(233, 236, 239, 0.8) 100%)',
                                    backdropFilter: 'blur(12px)',
                                    WebkitBackdropFilter: 'blur(12px)',
                                    borderRadius: isMobile ? '10px' : '15px',
                                    border: '1px solid rgba(255, 255, 255, 0.4)',
                                    minHeight: isMobile ? 'auto' : '400px',
                                    display: 'flex',
                                    flexDirection: isMobile ? 'column' : 'row',
                                    gap: isMobile ? '20px' : '0'
                                }}>
                                    {/* Content Section */}
                                    <div style={{
                                        position: 'relative',
                                        zIndex: 2,
                                        maxWidth: isMobile ? '100%' : '60%',
                                        order: isMobile ? 2 : 1
                                    }}>
                                        <div className="deal-top mb-3">
                                            <h2 className="text-brand mb-2" style={{
                                                fontSize: isMobile ? '20px' : '28px',
                                                fontWeight: 'bold'
                                            }}>
                                                Featured Product
                                            </h2>
                                            <h5 style={{
                                                color: '#666',
                                                fontSize: isMobile ? '13px' : '16px'
                                            }}>
                                                Handpicked just for you.
                                            </h5>
                                        </div>

                                        <h3 className="product-title mb-3" style={{
                                            fontSize: isMobile ? '16px' : '22px',
                                            fontWeight: '600',
                                            color: '#253D4E',
                                            lineHeight: '1.4'
                                        }}>
                                            {productTitle}
                                        </h3>

                                        <div className="mb-4">
                                            <div className="product-price" style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span className="current-price text-brand" style={{
                                                    fontSize: isMobile ? '24px' : '36px',
                                                    fontWeight: 'bold'
                                                }}>
                                                    ${typeof productPrice === 'number' ? productPrice.toFixed(2) : productPrice}
                                                </span>
                                                {productDiscount?.isActive && productDiscount?.percentage > 0 && (
                                                    <span className="save-price" style={{
                                                        background: '#ff6b6b',
                                                        color: 'white',
                                                        padding: isMobile ? '3px 10px' : '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: isMobile ? '12px' : '14px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {productDiscount.percentage}% Off
                                                    </span>
                                                )}
                                                {product.oldPrice && (
                                                    <span className="old-price" style={{
                                                        fontSize: isMobile ? '14px' : '18px',
                                                        textDecoration: 'line-through',
                                                        color: '#999'
                                                    }}>
                                                        ${product.oldPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="mb-4" style={{
                                            color: '#7E7E7E',
                                            fontSize: isMobile ? '13px' : '14px',
                                            display: isMobile ? 'none' : 'block'
                                        }}>
                                            Discover quality products at great prices!
                                        </p>

                                        <Link
                                            href="/product/[slug]"
                                            as={`/product/${productSlug}`}
                                            className="btn hover-up"
                                            style={{
                                                background: '#42af57',
                                                color: 'white',
                                                padding: isMobile ? '10px 20px' : '12px 30px',
                                                borderRadius: isMobile ? '6px' : '8px',
                                                fontSize: isMobile ? '14px' : '16px',
                                                fontWeight: '600',
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                border: 'none',
                                                textDecoration: 'none',
                                                transition: 'all 0.3s ease',
                                                width: isMobile ? '100%' : 'auto',
                                                justifyContent: 'center'
                                            }}
                                        >
                                            View Product <i className="fi-rs-arrow-right"></i>
                                        </Link>
                                    </div>

                                    {/* Image Section */}
                                    <div style={{
                                        position: isMobile ? 'relative' : 'absolute',
                                        bottom: isMobile ? 'auto' : '20px',
                                        right: isMobile ? 'auto' : '20px',
                                        width: isMobile ? '100%' : '300px',
                                        height: isMobile ? '200px' : '300px',
                                        zIndex: 1,
                                        order: isMobile ? 1 : 2
                                    }}>
                                        <Link href="/product/[slug]" as={`/product/${productSlug}`}>
                                            <img
                                                src={productImage}
                                                alt={productTitle}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'contain',
                                                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                                                }}
                                                onError={(e: any) => {
                                                    (e.target as HTMLImageElement).src = PRODUCT_FALLBACK_IMAGE;
                                                }}
                                            />
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className={openClass ? "modal-backdrop fade d-none" : "modal-backdrop fade show"}></div>
        </>
    );
};

export default IntroPopup;
