const ProductSkeleton = () => {
    return (
        <div className="product-cart-wrap mb-30">
            <div className="product-img-action-wrap">
                <div className="product-img product-img-zoom">
                    {/* Image skeleton */}
                    <div className="skeleton-box" style={{
                        width: '100%',
                        height: '250px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="skeleton-shimmer"></div>
                    </div>
                </div>
            </div>
            <div className="product-content-wrap">
                {/* Category skeleton */}
                <div className="skeleton-box mb-10" style={{
                    width: '60%',
                    height: '14px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="skeleton-shimmer"></div>
                </div>

                {/* Title skeleton */}
                <div className="skeleton-box mb-15" style={{
                    width: '90%',
                    height: '18px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="skeleton-shimmer"></div>
                </div>

                {/* Price skeleton */}
                <div className="product-card-bottom">
                    <div className="skeleton-box" style={{
                        width: '50%',
                        height: '24px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div className="skeleton-shimmer"></div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .skeleton-shimmer {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0) 0%,
                        rgba(255, 255, 255, 0.4) 50%,
                        rgba(255, 255, 255, 0) 100%
                    );
                    animation: shimmer 1.5s infinite;
                }

                .skeleton-box {
                    animation: pulse 1.5s ease-in-out infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductSkeleton;
