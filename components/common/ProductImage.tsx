import { CSSProperties, ImgHTMLAttributes, useEffect, useState, memo } from 'react';
import { PRODUCT_FALLBACK_IMAGE, proxifyImageUrl, generateSrcSet, ImageContext } from '../../lib/imageProxy';

type ProductImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  src?: string | null;
  fallbackSrc?: string;
  eager?: boolean;
  /** Image context controls responsive srcset generation and default sizing */
  context?: ImageContext;
};

const resolveSrc = (value?: string | null, fallbackSrc: string = PRODUCT_FALLBACK_IMAGE) => {
  const normalized = proxifyImageUrl(value);
  return normalized || fallbackSrc;
};

const baseStyle: CSSProperties = {
  backgroundColor: '#f8f9fa',
};

function ProductImage({
  src,
  alt,
  className,
  style,
  fallbackSrc = PRODUCT_FALLBACK_IMAGE,
  eager = false,
  context,
  onError,
  ...props
}: ProductImageProps) {
  const resolvedFallback = resolveSrc(fallbackSrc, PRODUCT_FALLBACK_IMAGE);
  const [imageSrc, setImageSrc] = useState(resolveSrc(src, resolvedFallback));
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    setImageSrc(resolveSrc(src, resolvedFallback));
    setUseFallback(false);
  }, [src, resolvedFallback]);

  // Generate responsive srcset when context is provided and not using fallback
  const responsive = !useFallback && context ? generateSrcSet(src, context) : null;

  return (
    <img
      {...props}
      src={imageSrc}
      srcSet={responsive?.srcSet}
      sizes={responsive?.sizes}
      alt={alt}
      className={className}
      loading={eager ? 'eager' : props.loading ?? 'lazy'}
      decoding={props.decoding ?? 'async'}
      fetchPriority={eager ? 'high' : props.fetchPriority ?? 'auto'}
      style={{ ...baseStyle, ...style }}
      onError={(event) => {
        const target = event.currentTarget;
        if (target.src !== resolvedFallback) {
          setImageSrc(resolvedFallback);
          setUseFallback(true);
        }

        onError?.(event);
      }}
    />
  );
}

export default memo(ProductImage);
