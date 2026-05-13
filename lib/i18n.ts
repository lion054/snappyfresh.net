/**
 * Simple i18n foundation for Snappy Fresh.
 *
 * Usage:
 *   import { t } from '../lib/i18n';
 *   <button>{t('cart.addToCart')}</button>
 *
 * To add a new language:
 *   1. Add a translations object (e.g., `shona`) with the same keys
 *   2. Add it to the `translations` map
 *   3. Set the active locale via setLocale()
 */

type TranslationKeys = typeof en;

const en = {
  // Common
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong. Please try again.',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.close': 'Close',
  'common.search': 'Search',
  'common.backToShop': 'Back to Shop',
  'common.learnMore': 'Learn More',
  'common.viewAll': 'View All',

  // Auth
  'auth.signIn': 'Sign In',
  'auth.signUp': 'Sign Up',
  'auth.logout': 'Logout',
  'auth.welcomeBack': 'Welcome Back!',
  'auth.forgotPassword': 'Forgot Password?',
  'auth.invalidCredentials': 'Invalid email or password. Please try again.',
  'auth.sessionExpired': 'Your session has expired. Please log in again.',
  'auth.loggedOut': 'You have been logged out successfully',

  // Cart
  'cart.addToCart': 'Add to cart',
  'cart.added': 'Added',
  'cart.myBasket': 'My Basket',
  'cart.yourCart': 'Your Shopping Cart',
  'cart.empty': 'Your cart is empty',
  'cart.clearCart': 'Clear Cart',
  'cart.subtotal': 'Subtotal',
  'cart.total': 'Total',
  'cart.checkout': 'Checkout',
  'cart.continueShopping': 'Continue Shopping',
  'cart.itemAdded': 'Added to cart',
  'cart.itemRemoved': 'Removed from cart',

  // Products
  'product.outOfStock': 'Out of stock',
  'product.onlyLeft': 'Only {count} left',
  'product.noProducts': 'No products found',
  'product.allCategories': 'All',

  // Checkout
  'checkout.title': 'Checkout',
  'checkout.placeOrder': 'Place Order',
  'checkout.orderSuccess': 'Order placed successfully!',
  'checkout.firstName': 'First Name',
  'checkout.lastName': 'Last Name',
  'checkout.email': 'Email Address',
  'checkout.phone': 'Phone Number',
  'checkout.address': 'Address Line 1',
  'checkout.deliveryScheduled': 'Scheduled Delivery',
  'checkout.deliveryInstant': 'ASAP Delivery',

  // Payments
  'payment.payNow': 'PayNow',
  'payment.ecocash': 'EcoCash',
  'payment.innbucks': 'InnBucks',
  'payment.failed': 'Payment failed. Please try again.',
  'payment.noRedirect': 'Payment initiated but no redirect link was returned. Please try again or contact support.',

  // Profile
  'profile.myShop': 'My Shop',
  'profile.settings': 'Settings',
  'profile.wallet': 'Wallet',
  'profile.invoices': 'Invoices',
  'profile.payments': 'Payments',
  'profile.statements': 'Statements',
  'profile.vendorPortal': 'Vendor Portal',
  'profile.switchAccount': 'Switch Account',

  // Errors
  'error.networkError': "We're having trouble connecting to our servers. Please check your internet connection and try again.",
  'error.notFound': 'Page not found',
  'error.serverError': 'Server error. Please try again later.',
  'error.tryAgain': 'Try Again',

  // Footer
  'footer.stayUpdated': 'Stay Updated with Daily Deals',
  'footer.flashSales': 'Flash Sales, Delivery Alerts & Exclusive Offers',
  'footer.downloadApp': 'Download the Snappy Fresh app',
  'footer.company': 'Company',
  'footer.customerSupport': 'Customer Support',

  // Cookie consent
  'cookies.message': 'We use cookies to improve your shopping experience, analyze site traffic, and personalize content.',
  'cookies.acceptAll': 'Accept All',
  'cookies.essentialOnly': 'Essential Only',
};

const translations: Record<string, typeof en> = {
  en,
  // Future: add 'sn' (Shona), 'nd' (Ndebele) here
};

let currentLocale = 'en';

export function setLocale(locale: string) {
  if (translations[locale]) {
    currentLocale = locale;
  }
}

export function getLocale(): string {
  return currentLocale;
}

/**
 * Translate a key, with optional interpolation.
 * @example t('product.onlyLeft', { count: 3 }) => "Only 3 left"
 */
export function t(key: keyof TranslationKeys, params?: Record<string, string | number>): string {
  const dict = translations[currentLocale] || translations['en'];
  let value = (dict as any)[key] || (translations['en'] as any)[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value;
}

export default t;
