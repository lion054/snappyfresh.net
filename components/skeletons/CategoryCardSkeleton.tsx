/**
 * CategoryCardSkeleton - Loading skeleton for category cards
 */
const CategoryCardSkeleton = () => {
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(236, 236, 236, 0.5)',
      borderRadius: '12px',
      padding: '20px',
      textAlign: 'center',
      animation: 'fadeInScale 0.4s ease'
    }}>
      {/* Icon Skeleton */}
      <div style={{
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        margin: '0 auto 15px'
      }} className="skeleton"></div>

      {/* Title Skeleton */}
      <div style={{
        width: '80%',
        height: '16px',
        borderRadius: '4px',
        margin: '0 auto 10px'
      }} className="skeleton"></div>

      {/* Count Skeleton */}
      <div style={{
        width: '50%',
        height: '14px',
        borderRadius: '4px',
        margin: '0 auto'
      }} className="skeleton"></div>
    </div>
  );
};

export default CategoryCardSkeleton;
