/**
 * SEO Configuration for Snappy Fresh
 * Ported from Angular seo.service.ts with React/Next.js adaptations
 */

// Base configuration
export const baseUrl = 'https://snappyfresh.net';
export const defaultImage = `${baseUrl}/assets/imgs/theme/snappy-logofull.png`;
export const siteName = 'Snappy Fresh';
export const businessName = 'Yomilk Ltd';

// Business information (Zimbabwe local SEO)
export const businessInfo = {
  name: siteName,
  alternateName: businessName,
  url: baseUrl,
  logo: defaultImage,
  description:
    "Zimbabwe's trusted online grocery store delivering fresh dairy, milk, yoghurt, and groceries in Harare",
  address: {
    streetAddress: '185 Lorely Close Msasa',
    addressLocality: 'Harare',
    addressCountry: 'ZW',
    postalCode: '',
  },
  telephone: '+263-782-978-460',
  email: 'support@snappyfresh.net',
  foundingDate: '2012',
  foundingLocation: 'Harare, Zimbabwe',
};

// Route-specific SEO configurations (ported from Angular seo.service.ts)
export const pageSeoConfig: Record<string, any> = {
  '/': {
    title: 'Snappy Fresh | Fresh Dairy, Milk & Groceries Delivery in Harare, Zimbabwe',
    description:
      'Order fresh dairy products, milk, yoghurt, cheese, bread and groceries online in Harare, Zimbabwe. Fast delivery, competitive prices. Shop now at Snappy Fresh!',
    keywords:
      'fresh milk Zimbabwe, dairy delivery Harare, online grocery Zimbabwe, yoghurt delivery, cheese products Zimbabwe, bread delivery Harare, Snappy Fresh, grocery delivery Zimbabwe',
    type: 'website',
    canonical: `${baseUrl}/`,
  },
  '/store': {
    title: 'Shop Fresh Dairy & Groceries | Snappy Fresh',
    description:
      'Browse our wide selection of fresh dairy products, milk, yoghurt, cheese, bread, and household items. Best prices in Harare with fast delivery to your doorstep.',
    keywords:
      'buy dairy online Zimbabwe, fresh milk Harare, yoghurt Zimbabwe, cheese delivery, grocery shopping Harare',
    type: 'website',
    canonical: `${baseUrl}/store`,
  },
  '/cart': {
    title: 'Shopping Cart | Snappy Fresh',
    description:
      'Review your shopping cart and checkout. Fast delivery of fresh dairy and groceries in Harare, Zimbabwe.',
    keywords: 'shopping cart, checkout, Snappy Fresh order',
    noindex: true,
  },
  '/checkout': {
    title: 'Checkout | Snappy Fresh',
    description:
      'Complete your order for fresh dairy and groceries. Multiple payment options available including EcoCash and InnBucks.',
    keywords: 'checkout, payment, EcoCash, InnBucks, order delivery',
    noindex: true,
  },
  '/login': {
    title: 'Sign In | Snappy Fresh',
    description:
      'Sign in to your Snappy Fresh account to access your orders, wishlist, and enjoy faster checkout.',
    keywords: 'login, sign in, Snappy Fresh account',
    noindex: true,
  },
  '/register': {
    title: 'Create Account | Snappy Fresh',
    description:
      'Create your Snappy Fresh account and start ordering fresh dairy and groceries online. Enjoy exclusive offers and fast delivery.',
    keywords: 'register, create account, sign up, Snappy Fresh',
    canonical: `${baseUrl}/register`,
  },
  '/profile': {
    title: 'My Account | Snappy Fresh',
    description:
      'Manage your Snappy Fresh account, view order history, update profile settings and delivery addresses.',
    keywords: 'my account, profile, order history, account settings',
    noindex: true,
  },
  '/profile/invoice': {
    title: 'My Invoices | Snappy Fresh',
    description: 'View and download your Snappy Fresh invoices and order receipts.',
    keywords: 'invoices, receipts, order history',
    noindex: true,
  },
  '/wallet': {
    title: 'My Wallet | Snappy Fresh',
    description: 'Manage your Snappy Fresh wallet balance and transaction history.',
    keywords: 'wallet, balance, payments, transactions',
    noindex: true,
  },
  '/scheduled-orders': {
    title: 'Scheduled Orders | Snappy Fresh Business',
    description:
      'View and manage your scheduled orders for recurring grocery delivery in Harare, Zimbabwe.',
    keywords: 'scheduled orders, recurring delivery, business delivery',
    noindex: true,
  },
  '/scheduled-new-order': {
    title: 'Create New Order | Snappy Fresh Business',
    description: 'Create and place new orders for your business. Fast and easy ordering.',
    keywords: 'new order, create order, business ordering, Snappy Fresh',
    noindex: true,
  },
  '/scheduled-history': {
    title: 'Scheduled Orders History | Snappy Fresh Business',
    description: 'View and manage all your scheduled business orders, order status, and delivery history.',
    keywords: 'scheduled orders, order history, order status, Snappy Fresh',
    noindex: true,
  },
  '/scheduled-billing': {
    title: 'Billing | Snappy Fresh Business',
    description: 'View your billing information, invoices, and payment history for Snappy Fresh orders.',
    keywords: 'billing, invoices, payment history, Snappy Fresh',
    noindex: true,
  },
  '/scheduled-statements': {
    title: 'Account Statements | Snappy Fresh Business',
    description: 'View detailed account statements and transaction history for your business account.',
    keywords: 'statements, account statements, transactions, account history, Snappy Fresh',
    noindex: true,
  },
  '/scheduled-dashboard': {
    title: 'Scheduled Orders Dashboard | Snappy Fresh Business',
    description: 'Overview of your delivery schedules, orders, and account activity.',
    keywords: 'dashboard, scheduled orders, delivery schedules, business overview, Snappy Fresh',
    noindex: true,
  },
  '/scheduled-history/detail': {
    title: 'Order Details | Snappy Fresh Business',
    description: 'View detailed information about your scheduled order including items, delivery, and payment status.',
    keywords: 'order details, scheduled order, order status, Snappy Fresh',
    noindex: true,
  },
  '/contact-us': {
    title: 'Contact Us | Snappy Fresh',
    description:
      "Get in touch with Snappy Fresh. We're here to help with your orders, deliveries, and any questions. Call +263 782 978 460 or email support@snappyfresh.net",
    keywords:
      'contact Snappy Fresh, customer support, help, phone number, email, Harare Zimbabwe',
    type: 'website',
    canonical: `${baseUrl}/contact-us`,
  },
  '/about-us': {
    title: 'About Us | Snappy Fresh',
    description:
      "Learn about Snappy Fresh - Zimbabwe's trusted online grocery store. We deliver fresh dairy, milk, yoghurt, and groceries right to your doorstep in Harare.",
    keywords:
      'about Snappy Fresh, company, Zimbabwe grocery, online store Harare, Yomilk Ltd',
    type: 'website',
    canonical: `${baseUrl}/about-us`,
  },
  '/faq': {
    title: 'FAQs | Snappy Fresh',
    description:
      'Find answers to frequently asked questions about ordering, delivery, payment methods, and more at Snappy Fresh.',
    keywords:
      'FAQ, frequently asked questions, help, delivery questions, payment, Snappy Fresh',
    type: 'website',
    canonical: `${baseUrl}/faq`,
  },
  '/check-order': {
    title: 'Track Your Order | Snappy Fresh',
    description:
      'Track your Snappy Fresh order status. Enter your order number to see real-time delivery updates.',
    keywords: 'track order, order status, delivery tracking, Snappy Fresh',
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Snappy Fresh',
    description:
      "Read Snappy Fresh's privacy policy. Learn how we protect your personal information and data.",
    keywords: 'privacy policy, data protection, personal information',
    canonical: `${baseUrl}/privacy-policy`,
  },
  '/terms': {
    title: 'Terms & Conditions | Snappy Fresh',
    description:
      "Read Snappy Fresh's terms and conditions for using our online grocery delivery service.",
    keywords: 'terms and conditions, terms of service, user agreement',
    canonical: `${baseUrl}/terms`,
  },
  '/vendors': {
    title: 'Our Vendors | Snappy Fresh',
    description:
      'Discover quality products from our trusted local vendors. Shop from the best suppliers in Zimbabwe at Snappy Fresh.',
    keywords:
      'vendors Zimbabwe, suppliers Harare, local vendors, grocery suppliers, Snappy Fresh vendors',
    type: 'website',
    canonical: `${baseUrl}/vendors`,
  },
  '/become-vendor': {
    title: 'Become a Vendor | Sell on Snappy Fresh',
    description:
      "Join Zimbabwe's fastest-growing online grocery marketplace. Reach thousands of customers, grow your business, and sell your products on Snappy Fresh.",
    keywords:
      'become vendor Zimbabwe, sell online Zimbabwe, vendor registration, marketplace seller, Snappy Fresh vendor',
    canonical: `${baseUrl}/become-vendor`,
  },
  '/purchase-guide': {
    title: 'How to Order | Purchase Guide | Snappy Fresh',
    description: 'Learn how to order fresh dairy and groceries online at Snappy Fresh. Step-by-step guide for first-time customers.',
    keywords: 'how to order, ordering guide, first time customer, Snappy Fresh',
  },
};

/**
 * Generate SEO config for product detail pages
 * @param {Object} product - Product object from API
 * @returns {Object} SEO configuration object
 */
export const generateProductSeo = (product: any) => {
  // Extract product name from multiple possible field names
  const productName =
    product?.title ||
    product?.ItemName ||
    product?.itemName ||
    product?.name ||
    'Product';

  // Extract description from multiple possible field names
  const description =
    (product?.u_ONA_Description ||
      product?.description ||
      product?.Description ||
      '')
      .substring(0, 150) + '...';

  // Extract image from multiple possible field names
  const productImage =
    product?.image ||
    product?.images?.[0]?.img ||
    product?.pictures?.[0] ||
    product?.ImageUrl ||
    defaultImage;

  // Extract price and availability
  const price = product?.price || product?.Price || 'Contact for price';
  const availability = product?.stock > 0 || product?.Stock > 0 ? 'InStock' : 'OutOfStock';

  return {
    title: `${productName} | Buy Online at Snappy Fresh`,
    description: `Buy ${productName} online at Snappy Fresh. ${description} Fast delivery in Harare, Zimbabwe.`,
    keywords: `${productName}, buy ${productName} Zimbabwe, ${productName} Harare, dairy products, groceries`,
    ogImage: productImage,
    canonical: `/product/${product?.itemCode || product?.ItemCode || ''}`,
    type: 'product',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: productName,
      description: product?.u_ONA_Description || product?.description || `High-quality ${productName} from Snappy Fresh`,
      image: productImage,
      brand: {
        '@type': 'Brand',
        name: 'Snappy Fresh',
      },
      offers: {
        '@type': 'Offer',
        url: `${baseUrl}/product/${product?.itemCode || product?.ItemCode || ''}`,
        priceCurrency: 'USD',
        price: price,
        availability: `https://schema.org/${availability}`,
        seller: {
          '@type': 'Organization',
          name: 'Snappy Fresh',
        },
      },
    },
  };
};

/**
 * Generate SEO config for category pages
 * @param {string} categoryName - Category name
 * @returns {Object} SEO configuration object
 */
export const generateCategorySeo = (categoryName: any) => {
  return {
    title: `${categoryName} Products | Snappy Fresh`,
    description: `Shop ${categoryName.toLowerCase()} products online at Snappy Fresh. Best prices, fresh quality, fast delivery in Harare, Zimbabwe.`,
    keywords: `${categoryName} Zimbabwe, buy ${categoryName.toLowerCase()} online, ${categoryName.toLowerCase()} delivery Harare, Snappy Fresh`,
    type: 'website',
  };
};

/**
 * Generate breadcrumb structured data
 * @param {Array} breadcrumbs - Array of { name, url } objects
 * @returns {Object} BreadcrumbList structured data
 */
export const generateBreadcrumbSchema = (breadcrumbs: any) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb: any, index: any) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.url}`,
    })),
  };
};

/**
 * Generate organization structured data
 * @returns {Object} Organization structured data
 */
export const generateOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: businessInfo.name,
    alternateName: businessInfo.alternateName,
    url: businessInfo.url,
    logo: businessInfo.logo,
    description: businessInfo.description,
    foundingDate: businessInfo.foundingDate,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address.streetAddress,
      addressLocality: businessInfo.address.addressLocality,
      addressCountry: businessInfo.address.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: businessInfo.telephone,
      contactType: 'Customer Service',
      areaServed: 'ZW',
      availableLanguage: 'en',
    },
    sameAs: [
      'https://facebook.com/snappyfreshzw',
      'https://twitter.com/snappyfreshzw',
      'https://instagram.com/snappyfreshzw',
    ],
  };
};

/**
 * Generate local business structured data
 * @returns {Object} LocalBusiness structured data
 */
export const generateLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'GroceryStore',
    name: businessInfo.name,
    url: businessInfo.url,
    logo: businessInfo.logo,
    image: businessInfo.logo,
    description: businessInfo.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessInfo.address.streetAddress,
      addressLocality: businessInfo.address.addressLocality,
      addressCountry: businessInfo.address.addressCountry,
    },
    telephone: businessInfo.telephone,
    email: businessInfo.email,
    priceRange: '$$',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -17.8252,
      longitude: 31.0335,
    },
    areaServed: {
      '@type': 'City',
      name: 'Harare',
      '@id': 'https://en.wikipedia.org/wiki/Harare',
    },
  };
};
