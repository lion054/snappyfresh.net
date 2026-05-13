/**
 * Products Loading State Component
 * Handles loading, error, empty, and offline states
 */

import { useProducts } from '../contexts/ProductsContext';
import ProductSkeleton from './elements/ProductSkeleton';

interface ProductsLoadingStateProps {
  /** Number of skeleton items to show */
  skeletonCount?: number;
  /** Custom error message */
  errorMessage?: string;
  /** Show retry button on error */
  showRetry?: boolean;
  /** Custom empty message */
  emptyMessage?: string;
  /** Render prop for success state */
  children: (products: any[]) => React.ReactNode;
}

const ProductsLoadingState = ({
  skeletonCount = 12,
  errorMessage,
  showRetry = true,
  emptyMessage,
  children,
}: ProductsLoadingStateProps) => {
  const { products, loading, isReady, error, refetch, isFetching } = useProducts();

  // Loading state (initial load)
  if (loading && !isReady) {
    return (
      <>
        <div className="shop-product-fillter" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "2px solid #dee2e6"
        }}>
          <div className="totall-product">
            <p style={{
              fontSize: "16px",
              color: "#2d3748",
              fontWeight: "500",
              margin: "0"
            }}>
              <i className="fi-rs-loading" style={{ marginRight: '8px' }}></i>
              Loading products...
            </p>
          </div>
        </div>
        <div className="row product-grid-3">
          {[...Array(skeletonCount)].map((_, i) => (
            <div className="col-lg-1-5 col-md-4 col-12 col-sm-6" key={i}>
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </>
    );
  }

  // Error state (no cached data available)
  if (error && !isReady) {
    return (
      <div className="text-center py-5">
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          <i className="fi-rs-exclamation" style={{
            fontSize: '48px',
            color: '#ffc107',
            marginBottom: '20px',
            display: 'block',
          }}></i>
          <h3 style={{ marginBottom: '15px', color: '#856404' }}>
            Unable to Load Products
          </h3>
          <p style={{ color: '#856404', marginBottom: '20px' }}>
            {errorMessage || error || 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.'}
          </p>
          {showRetry && (
            <button
              onClick={() => refetch()}
              style={{
                backgroundColor: '#1a5c38',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '12px 30px',
                fontSize: '16px',
                cursor: 'pointer',
                fontWeight: '600',
                marginRight: '10px',
              }}
            >
              <i className="fi-rs-refresh" style={{ marginRight: '8px' }}></i>
              Try Again
            </button>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#fff',
              color: '#1a5c38',
              border: '2px solid #1a5c38',
              borderRadius: '4px',
              padding: '12px 30px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // Empty state (loaded but no products)
  if (isReady && products.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fi-rs-box" style={{
          fontSize: '64px',
          color: '#cbd5e0',
          marginBottom: '20px',
          display: 'block',
        }}></i>
        <h3 style={{ marginBottom: '15px' }}>No Products Available</h3>
        <p style={{ color: '#718096' }}>
          {emptyMessage || 'We couldn\'t find any products at the moment. Please check back later.'}
        </p>
        {showRetry && (
          <button
            onClick={() => refetch()}
            style={{
              backgroundColor: '#1a5c38',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '12px 30px',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '20px',
            }}
          >
            <i className="fi-rs-refresh" style={{ marginRight: '8px' }}></i>
            Refresh
          </button>
        )}
      </div>
    );
  }

  // Background refresh indicator (show subtle indicator without blocking UI)
  const showRefreshingIndicator = isFetching && isReady;

  // Success state - render children
  return (
    <>
      {showRefreshingIndicator && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: '#1a5c38',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '14px',
          fontWeight: '500',
          animation: 'slideInRight 0.3s ease',
        }}>
          <i className="fi-rs-loading" style={{ marginRight: '8px' }}></i>
          Updating products...
        </div>
      )}
      {children(products)}
    </>
  );
};

export default ProductsLoadingState;
