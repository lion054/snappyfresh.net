/**
 * JSON-LD Structured Data Schemas for Snappy Fresh
 * These schemas help search engines understand page content and enable rich search results
 */

import { baseUrl, businessInfo, defaultImage } from '../config/seo';

/**
 * Website Schema - For site search functionality
 */
export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  url: baseUrl,
  name: 'Snappy Fresh',
  description: 'Fresh dairy and groceries delivery in Harare, Zimbabwe',
  image: defaultImage,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/shop?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

/**
 * FAQ Page Schema
 */
export const generateFaqSchema = (faqs: any) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq: any) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

/**
 * Product Collection Schema (for category pages)
 */
export const generateProductCollectionSchema = (categoryName: any, productCount: any) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: `${categoryName} Products | Snappy Fresh`,
  description: `Browse our collection of ${categoryName.toLowerCase()} products`,
  url: `${baseUrl}/shop?category=${categoryName}`,
  mainEntity: {
    '@type': 'Collection',
    name: categoryName,
    numberOfItems: productCount,
  },
});

/**
 * Contact Page Schema
 */
export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  url: `${baseUrl}/contact`,
  name: 'Contact Snappy Fresh',
  description: 'Get in touch with Snappy Fresh customer service',
  mainEntity: {
    '@type': 'Organization',
    name: businessInfo.name,
    url: businessInfo.url,
    telephone: businessInfo.telephone,
    email: businessInfo.email,
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
    },
  },
};

/**
 * About Page Schema
 */
export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  url: `${baseUrl}/about`,
  name: 'About Snappy Fresh',
  mainEntity: {
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
    sameAs: [
      'https://facebook.com/snappyfreshzw',
      'https://twitter.com/snappyfreshzw',
    ],
  },
};

/**
 * Event Schema - For time-limited offers or events
 */
export const generateEventSchema = (eventName: any, startDate: any, endDate: any, description: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Event',
  name: eventName,
  description: description,
  startDate: startDate,
  endDate: endDate,
  eventStatus: 'https://schema.org/EventScheduled',
  eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
  organizer: {
    '@type': 'Organization',
    name: businessInfo.name,
    url: businessInfo.url,
  },
  location: {
    '@type': 'VirtualLocation',
    url: `${baseUrl}/shop`,
  },
});

/**
 * AggregateOffer Schema - For displaying price ranges
 */
export const generateAggregateOfferSchema = (products: any) => ({
  '@context': 'https://schema.org',
  '@type': 'AggregateOffer',
  priceCurrency: 'USD',
  lowPrice: Math.min(...products.map((p: any) => p.price)),
  highPrice: Math.max(...products.map((p: any) => p.price)),
  offerCount: products.length,
  offers: products.map((product: any) => ({
    '@type': 'Offer',
    url: `${baseUrl}/product/${product.itemCode}`,
    name: product.name,
    priceCurrency: 'USD',
    price: product.price,
    availability: product.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  })),
});

/**
 * Review Schema (for products with reviews)
 */
export const generateReviewSchema = (productName: any, reviews: any) => ({
  '@context': 'https://schema.org',
  '@type': 'Review',
  itemReviewed: {
    '@type': 'Product',
    name: productName,
  },
  reviewRating: {
    '@type': 'AggregateRating',
    ratingValue: (
      reviews.reduce((sum: any, r: any) => sum + r.rating, 0) / reviews.length
    ).toFixed(1),
    reviewCount: reviews.length,
  },
  review: reviews.map((review: any) => ({
    '@type': 'Review',
    reviewRating: {
      '@type': 'Rating',
      ratingValue: review.rating,
    },
    reviewBody: review.text,
    author: {
      '@type': 'Person',
      name: review.author,
    },
    datePublished: review.date,
  })),
});

/**
 * Action Schema - For adding to cart action
 */
export const generateAddToCartSchema = (product: any) => ({
  '@context': 'https://schema.org',
  '@type': 'AddAction',
  target: `${baseUrl}/cart`,
  object: {
    '@type': 'Product',
    name: product.name,
    sku: product.itemCode,
    image: product.image,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'USD',
    },
  },
});

/**
 * Delivery Service Schema
 */
export const deliveryServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'DeliveryService',
  name: 'Snappy Fresh Delivery',
  url: `${baseUrl}/check-order`,
  areaServed: {
    '@type': 'City',
    name: 'Harare',
    '@id': 'https://en.wikipedia.org/wiki/Harare',
  },
  availableService: {
    '@type': 'Service',
    name: 'Grocery Delivery in Harare',
    provider: {
      '@type': 'Organization',
      name: businessInfo.name,
    },
  },
};

/**
 * Payment Method Schema
 */
export const paymentMethodsSchema = {
  '@context': 'https://schema.org',
  '@type': 'PaymentMethod',
  name: 'Snappy Fresh Payment Methods',
  acceptedPaymentMethod: [
    {
      '@type': 'PaymentMethod',
      name: 'EcoCash',
    },
    {
      '@type': 'PaymentMethod',
      name: 'InnBucks',
    },
    {
      '@type': 'PaymentMethod',
      name: 'PayNow',
    },
    {
      '@type': 'PaymentMethod',
      name: 'Credit Card',
    },
  ],
};

/**
 * Offer Schema - For promotional offers
 */
export const generateOfferSchema = (product: any, discountPercentage: any) => {
  const originalPrice = product.price;
  const discountedPrice = originalPrice * (1 - discountPercentage / 100);

  return {
    '@context': 'https://schema.org',
    '@type': 'Offer',
    url: `${baseUrl}/product/${product.itemCode}`,
    priceCurrency: 'USD',
    price: discountedPrice.toFixed(2),
    priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    itemOffered: {
      '@type': 'Product',
      name: product.name,
      image: product.image,
      description: product.description,
    },
    discount: `${discountPercentage}%`,
    discountCode: product.promoCode || '',
    availability: 'https://schema.org/InStock',
    seller: {
      '@type': 'Organization',
      name: businessInfo.name,
    },
  };
};

export default {
  websiteSchema,
  generateFaqSchema,
  generateProductCollectionSchema,
  contactPageSchema,
  aboutPageSchema,
  generateEventSchema,
  generateAggregateOfferSchema,
  generateReviewSchema,
  generateAddToCartSchema,
  deliveryServiceSchema,
  paymentMethodsSchema,
  generateOfferSchema,
};
