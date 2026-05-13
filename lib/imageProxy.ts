export const PRODUCT_FALLBACK_IMAGE = '/assets/images/products/product-placeholder.webp';

// In production, the server can't reach ERP port 3330 (firewall).
// Serve images directly from the ERP CDN — browsers CAN reach it.
// In development, use the local proxy for sharp optimization.
const ERP_CDN_BASE = 'https://yomilk.erpona.com:3330/';
const USE_DIRECT_CDN = process.env.NODE_ENV === 'production';
const IMAGE_PROXY_PATH = '/api/img-proxy?path=';

const LOCAL_ASSET_PREFIXES = ['/assets/', '/icons/', '/media/', '/static/', '/_next/'];
const ERP_HOST_PATTERN = /^https?:\/\/yomilk\.erpona\.com:3330\//i;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const FILE_LIKE_PATTERN = /\.(avif|bmp|gif|jpe?g|jfif|png|svg|webp)(\?.*)?$/i;

const isLocalAssetPath = (value: string) => LOCAL_ASSET_PREFIXES.some((prefix) => value.startsWith(prefix));
const isAlreadyProxied = (value: string) => value.startsWith('/api/img-proxy') || value.startsWith('/img-proxy.php');

export type ImageContext = 'thumb' | 'card' | 'detail' | 'zoom';

const CONTEXT_WIDTHS: Record<ImageContext, number[]> = {
  thumb: [200],
  card: [200, 400],
  detail: [400, 800],
  zoom: [800, 1600],
};

const CONTEXT_SIZES: Record<ImageContext, string> = {
  thumb: '80px',
  card: '(max-width: 767px) 140px, 200px',
  detail: '(max-width: 767px) 100vw, 50vw',
  zoom: '100vw',
};

function toImageProxyUrl(path: string, width?: number): string {
  const cleanPath = path.replace(/^\/+/, '');

  // In production, serve directly from ERP CDN (server can't reach port 3330)
  if (USE_DIRECT_CDN) {
    return `${ERP_CDN_BASE}${cleanPath}`;
  }

  // In development, use local proxy for sharp optimization
  const encoded = encodeURIComponent(cleanPath);
  let url = `${IMAGE_PROXY_PATH}${encoded}&f=auto`;
  if (width) url += `&w=${width}`;
  return url;
}


const normalizeImageValue = (value: string): string => {
  if (typeof value !== 'string') return '';

  const normalized = value.trim().replace(/\\/g, '/');
  if (!normalized || normalized === 'null' || normalized === 'undefined') {
    return '';
  }

  return normalized;
};

const pushCandidate = (candidates: string[], seen: Set<string>, value: any) => {
  const normalized = normalizeImageValue(value);
  if (!normalized || seen.has(normalized)) {
    return;
  }

  seen.add(normalized);
  candidates.push(normalized);
};

const collectNestedImageCandidates = (value: any, candidates: string[], seen: Set<string>) => {
  if (!value) return;

  if (typeof value === 'string') {
    pushCandidate(candidates, seen, value);
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectNestedImageCandidates(item, candidates, seen));
    return;
  }

  if (typeof value === 'object') {
    [
      value.img,
      value.image,
      value.url,
      value.src,
      value.thumb,
      value.thumbnail,
      value.path,
      value.fileName,
      value.filename,
      value.value,
      value.PicturName,
      value.picturName,
      value.Picture,
      value.picture,
      value.ImageUrl,
      value.imageUrl,
      value.ImageURL,
      value.imageURL,
    ].forEach((item) => pushCandidate(candidates, seen, item));
  }
};

export function getProductImageCandidates(product: any): string[] {
  if (!product) return [];

  const candidates: string[] = [];
  const seen = new Set<string>();
  const imageSets = [
    product.image,
    product.Image,
    product.imageUrl,
    product.image_url,
    product.ImageUrl,
    product.ImageURL,
    product.ImagePath,
    product.imagePath,
    product.PicturName,
    product.picturName,
    product.Picture,
    product.picture,
    product.PictureName,
    product.pictureName,
    product.Photo,
    product.photo,
    product.thumbnail,
    product.thumb,
    product.smallImage,
    product.mediumImage,
    product.largeImage,
    product.images,
    product.pictures,
    product.gallery,
    product.galleryImages,
    product.media,
    product.attachments,
    product.attachment,
  ];

  imageSets.forEach((value) => collectNestedImageCandidates(value, candidates, seen));

  return candidates;
}

export function getProductImageUrl(product: any, fallback: string = PRODUCT_FALLBACK_IMAGE): string {
  const [firstCandidate] = getProductImageCandidates(product);
  return firstCandidate ? proxifyImageUrl(firstCandidate) : fallback;
}

export function proxifyImageUrl(url: string | null | undefined, width?: number): string {
  if (!url) return '';
  const normalized = normalizeImageValue(url);
  if (!normalized) return '';

  // Already a proxy URL — return as-is to avoid double-encoding
  if (isAlreadyProxied(normalized)) {
    return normalized;
  }

  if (isLocalAssetPath(normalized)) {
    return normalized;
  }

  if (ERP_HOST_PATTERN.test(normalized)) {
    return toImageProxyUrl(new URL(normalized).pathname, width);
  }

  if (ABSOLUTE_URL_PATTERN.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith('/')) {
    return toImageProxyUrl(normalized, width);
  }

  if (normalized.includes('/') || FILE_LIKE_PATTERN.test(normalized)) {
    return toImageProxyUrl(normalized, width);
  }

  return toImageProxyUrl(normalized, width);
}

/**
 * Generate srcset and sizes attributes for responsive images.
 * Returns null for local assets that don't go through the proxy.
 */
export function generateSrcSet(
  url: string | null | undefined,
  context: ImageContext = 'card'
): { srcSet: string; sizes: string } | null {
  if (!url) return null;

  // No srcset in production — images served directly from CDN without resize proxy
  if (USE_DIRECT_CDN) return null;

  const normalized = normalizeImageValue(url);
  if (!normalized) return null;

  // Local assets, external URLs, and already-proxied URLs don't get srcset
  if (isLocalAssetPath(normalized) || isAlreadyProxied(normalized) || ABSOLUTE_URL_PATTERN.test(normalized)) {
    return null;
  }

  // Extract the raw path for proxy URLs
  let rawPath: string;
  if (ERP_HOST_PATTERN.test(normalized)) {
    rawPath = new URL(normalized).pathname;
  } else {
    rawPath = normalized;
  }

  const widths = CONTEXT_WIDTHS[context];
  const srcSet = widths
    .map((w) => `${toImageProxyUrl(rawPath, w)} ${w}w`)
    .join(', ');

  return {
    srcSet,
    sizes: CONTEXT_SIZES[context],
  };
}
