import Head from 'next/head';
import { useRouter } from 'next/router';
import { baseUrl, defaultImage } from '../../config/seo';

/**
 * Reusable SEO component for managing meta tags, Open Graph, Twitter Cards, and structured data
 *
 * Props:
 * - title: Page title (max 60 chars recommended)
 * - description: Meta description (max 160 chars recommended)
 * - keywords: Comma-separated keywords (optional)
 * - ogImage: Open Graph image URL (default: company logo)
 * - ogUrl: Open Graph URL (default: current page URL)
 * - canonical: Canonical URL (default: current page URL)
 * - type: OG type (website, product, article - default: website)
 * - structuredData: JSON-LD structured data object (optional)
 * - noindex: Whether to add noindex, nofollow (default: false)
 * - twitterSite: Twitter handle (optional, e.g., @SnappyFreshZW)
 */
const SEO = ({
  title = '',
  description = '',
  keywords = '',
  ogImage = defaultImage,
  ogUrl = '',
  canonical = '',
  type = 'website',
  structuredData = null,
  noindex = false,
  twitterSite = '',
}) => {
  const router = useRouter();
  const currentUrl = `${baseUrl}${router.asPath.split('?')[0]}`;

  // Use provided URL or fall back to current URL
  const fullOgUrl = ogUrl || currentUrl;
  const canonicalUrl = canonical || currentUrl;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="Snappy Fresh" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullOgUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Snappy Fresh" />
      <meta property="og:locale" content="en_ZW" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}

      {/* Additional Meta Tags */}
      <meta name="lang" content="en" />
      <meta charSet="utf-8" />

      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Head>
  );
};

export default SEO;
