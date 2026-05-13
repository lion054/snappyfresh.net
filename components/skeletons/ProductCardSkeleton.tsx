/**
 * ProductCardSkeleton - Loading skeleton for product cards
 */
const ProductCardSkeleton = () => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(236, 236, 236, 0.5)',
      borderRadius: '15px',
      padding: '20px',
      animation: 'fadeInScale 0.4s ease'
    }}>
      {/* Image Skeleton */}
      <div style={{
        width: '100%',
        height: '200px',
        borderRadius: '10px',
        marginBottom: '15px'
      }} className="skeleton"></div>

      {/* Category Skeleton */}
      <div style={{
        width: '60%',
        height: '14px',
        borderRadius: '4px',
        marginBottom: '10px'
      }} className="skeleton"></div>

      {/* Title Skeleton */}
      <div style={{
        width: '90%',
        height: '18px',
        borderRadius: '4px',
        marginBottom: '8px'
      }} className="skeleton"></div>
      <div style={{
        width: '70%',
        height: '18px',
        borderRadius: '4px',
        marginBottom: '15px'
      }} className="skeleton"></div>

      {/* Price Skeleton */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '80px',
          height: '24px',
          borderRadius: '4px'
        }} className="skeleton"></div>
        <div style={{
          width: '50px',
          height: '20px',
          borderRadius: '4px'
        }} className="skeleton"></div>
      </div>

      {/* Button Skeleton */}
      <div style={{
        width: '100%',
        height: '40px',
        borderRadius: '8px'
      }} className="skeleton"></div>
    </div>
  );
};

export default ProductCardSkeleton;
