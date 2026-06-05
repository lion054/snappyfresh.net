/**
 * Snappy Fresh - Global API Configuration
 * This configuration is used by both the HTML/Angular UI and React frontend
 */

const API_CONFIG = {
  // API Base URLs
  apiURL: 'https://yomilk.onaerp.africa:8092/api/',
  authUrl: 'https://yomilk.onaerp.africa:8092/api/',

  // Site Configuration
  siteUrl: 'https://snappyfresh.net/',
  returnUrl: 'https://snappyfresh.net/check-order',
  companyName: 'Yomilk',
  title: 'Snappy Fresh',

  // Currency & Settings
  currency: 'USD',
  innbucksInterval: 30000,

  // Analytics
  pixelId: '1334321168343886',
  gaMeasurementId: 'G-CDF4721TLQ',

  /**
   * Make a GET request to the API
   * @param {string} endpoint - The API endpoint (e.g., 'items/store')
   * @param {object} params - URL parameters to replace (optional)
   * @returns {Promise} Response data
   */
  get: async function(endpoint, params = {}) {
    const url = this.buildUrl(endpoint, params);
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  /**
   * Make a POST request to the API
   * @param {string} endpoint - The API endpoint (e.g., 'users/login')
   * @param {object} data - Request body data
   * @returns {Promise} Response data
   */
  post: async function(endpoint, data = {}) {
    const url = this.buildUrl(endpoint);
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  /**
   * Make a PUT request to the API
   * @param {string} endpoint - The API endpoint
   * @param {object} data - Request body data
   * @returns {Promise} Response data
   */
  put: async function(endpoint, data = {}) {
    const url = this.buildUrl(endpoint);
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  /**
   * Make a DELETE request to the API
   * @param {string} endpoint - The API endpoint
   * @returns {Promise} Response data
   */
  delete: async function(endpoint) {
    const url = this.buildUrl(endpoint);
    const token = this.getToken();

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        }
      });

      return await this.handleResponse(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  /**
   * Build the full API URL
   * @param {string} endpoint - The API endpoint
   * @param {object} params - URL parameters to replace (optional)
   * @returns {string} Full URL
   */
  buildUrl: function(endpoint, params = {}) {
    let url = endpoint;

    // Replace path parameters (e.g., :itemCode)
    Object.keys(params).forEach(key => {
      url = url.replace(`:${key}`, params[key]);
    });

    return this.apiURL + url;
  },

  /**
   * Handle API response
   * @param {Response} response - Fetch API response
   * @returns {Promise} Parsed response data
   */
  handleResponse: async function(response) {
    if (response.status === 401) {
      // Unauthorized - clear token and redirect to login
      this.clearToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Unauthorized - Session expired');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: `HTTP Error ${response.status}`
      }));
      throw new Error(error.message || error.error || 'Request failed');
    }

    return await response.json();
  },

  /**
   * Get authentication token from localStorage
   * @returns {string|null} Auth token
   */
  getToken: function() {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('authToken') || localStorage.getItem('token');
    }
    return null;
  },

  /**
   * Set authentication token in localStorage
   * @param {string} token - JWT token
   */
  setToken: function(token) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
    }
  },

  /**
   * Clear authentication token from localStorage
   */
  clearToken: function() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated: function() {
    return !!this.getToken();
  },

  // ====== AUTHENTICATION ENDPOINTS ======

  /**
   * Get guest/cash customer session
   * @returns {Promise} Session token and auth response
   */
  getCashCustomerSession: async function() {
    return this.get('Auths/CashCustomer/Session');
  },

  /**
   * Login with business partner credentials
   * @param {string} username - Email or username
   * @param {string} password - Password
   * @param {string} companyDB - Database name (optional)
   * @returns {Promise} Auth response with token
   */
  loginBusinessPartner: async function(username, password, companyDB = '') {
    return this.post('Auths/Login/BusinessPartners', {
      username,
      password,
      companyDB
    });
  },

  /**
   * Register new external user
   * @param {object} data - Registration data
   * @returns {Promise} Registration response
   */
  registerUser: async function(data) {
    return this.post('ExternalUsers/Register', data);
  },

  /**
   * Verify user email
   * @param {string} email - User email
   * @param {string} token - Verification token
   * @returns {Promise} Verification result
   */
  verifyEmail: async function(email, token) {
    return this.get('ExternalUsers/Verify', { email, token });
  },

  /**
   * Request password reset OTP
   * @param {string} emailAddress - User email
   * @returns {Promise} OTP sent confirmation
   */
  requestPasswordResetOtp: async function(emailAddress) {
    return this.post('ExternalUsers/ResetPassword/GetOtp', { emailAddress });
  },

  /**
   * Reset password with OTP
   * @param {object} data - Password reset data
   * @returns {Promise} Password reset confirmation
   */
  resetPassword: async function(data) {
    return this.post('ExternalUsers/ResetPassword', data);
  },

  // ====== PRODUCT ENDPOINTS ======

  /**
   * Get all store items (products)
   * @param {object} params - Query parameters (pageSize, pageNumber, currency, filterExtension)
   * @returns {Promise} ProductList with pagination
   */
  getStoreItems: async function(params = {}) {
    const defaults = { pageSize: 100, pageNumber: 1, currency: 'USD' };
    const queryParams = { ...defaults, ...params };
    return this.get('StoreItems', queryParams);
  },

  /**
   * Get single product by item code
   * @param {string} itemCode - Product item code
   * @returns {Promise} Product details
   */
  getStoreItem: async function(itemCode) {
    return this.get(`StoreItems/${itemCode}`);
  },

  /**
   * Get product categories
   * @param {object} params - Query parameters (pageSize, pageNumber)
   * @returns {Promise} Category list
   */
  getStoreItemGroups: async function(params = {}) {
    const defaults = { pageSize: 100, pageNumber: 1 };
    const queryParams = { ...defaults, ...params };
    return this.get('StoreItemGroups', queryParams);
  },

  /**
   * Get upsell product recommendations
   * @param {array} itemCodes - Array of item codes
   * @returns {Promise} Recommended upsell products
   */
  getUpsellProducts: async function(itemCodes) {
    return this.post('StoreItems/Upsells', { itemCodes });
  },

  /**
   * Get cross-sell product recommendations
   * @param {array} itemCodes - Array of item codes
   * @returns {Promise} Recommended cross-sell products
   */
  getCrossSellProducts: async function(itemCodes) {
    return this.post('StoreItems/CrossSells', { itemCodes });
  },

  // ====== SHOPPING CART ENDPOINTS ======

  /**
   * Get user's shopping cart
   * @returns {Promise} Cart contents with items and totals
   */
  getCart: async function() {
    return this.get('Cart');
  },

  /**
   * Add item to cart
   * @param {string} itemCode - Product item code
   * @param {number} quantity - Quantity to add
   * @param {number} unitPrice - Unit price (optional)
   * @returns {Promise} Added cart item
   */
  addToCart: async function(itemCode, quantity, unitPrice = null) {
    return this.post('Cart', { itemCode, quantity, unitPrice });
  },

  /**
   * Update cart item quantity
   * @param {string} cartItemId - Cart item ID
   * @param {number} quantity - New quantity
   * @returns {Promise} Updated cart item
   */
  updateCartItem: async function(cartItemId, quantity) {
    return this.put(`Cart/${cartItemId}`, { quantity });
  },

  /**
   * Remove item from cart
   * @param {string} cartItemId - Cart item ID
   * @returns {Promise} Removal confirmation
   */
  removeFromCart: async function(cartItemId) {
    return this.delete(`Cart/${cartItemId}`);
  },

  /**
   * Clear entire shopping cart
   * @returns {Promise} Clear confirmation
   */
  clearCart: async function() {
    return this.delete('Cart');
  },

  // ====== ORDER ENDPOINTS ======

  /**
   * Get store invoices (orders)
   * @param {object} params - Query parameters
   * @returns {Promise} Invoice list
   */
  getStoreInvoices: async function(params = {}) {
    const defaults = { pageSize: 20, pageNumber: 1 };
    const queryParams = { ...defaults, ...params };
    return this.get('StoreInvoices', queryParams);
  },

  /**
   * Get invoice details
   * @param {integer} docEntry - Document entry ID
   * @returns {Promise} Invoice details
   */
  getStoreInvoice: async function(docEntry) {
    return this.get(`StoreInvoices/${docEntry}`);
  },

  // ====== PAYMENT ENDPOINTS ======

  /**
   * Get incoming payments
   * @param {object} params - Query parameters (pageSize, pageNumber)
   * @returns {Promise} Payment list
   */
  getIncomingPayments: async function(params = {}) {
    const defaults = { pageSize: 20, pageNumber: 1 };
    const queryParams = { ...defaults, ...params };
    return this.get('StoreIncomingPayments', queryParams);
  },

  /**
   * Create incoming payment
   * @param {object} data - Payment data
   * @returns {Promise} Payment confirmation
   */
  createIncomingPayment: async function(data) {
    return this.post('StoreIncomingPayments', data);
  },

  /**
   * Initiate PayNow payment
   * @param {string} cardCode - Customer card code
   * @param {number} transferSum - Payment amount
   * @returns {Promise} Payment redirect link
   */
  initiatePayNowPayment: async function(cardCode, transferSum) {
    return this.post('StoreIncomingPayments/PayNow/InitiatePayment', {
      cardCode,
      transferSum,
      paymentMethod: 'PayNow'
    });
  },

  /**
   * Get InnBucks payment code
   * @param {string} cardCode - Customer card code
   * @param {number} transferSum - Payment amount
   * @param {string} paymentPhoneNumber - Phone number
   * @returns {Promise} Payment code and QR code
   */
  getInnBucksPaymentCode: async function(cardCode, transferSum, paymentPhoneNumber) {
    return this.post('StoreIncomingPayments/InnBucks/GetPaymentCode', {
      cardCode,
      transferSum,
      paymentPhoneNumber,
      paymentMethod: 'InnBucks'
    });
  },

  /**
   * Check InnBucks payment status
   * @param {string} reference - Payment reference
   * @param {string} code - Payment code
   * @returns {Promise} Payment status
   */
  checkInnBucksPaymentStatus: async function(reference, code) {
    return this.post('InnBucks/EnquireCode', { reference, code });
  },

  // ====== BUSINESS PARTNER ENDPOINTS ======

  /**
   * Get business partner details
   * @param {string} cardCode - Customer card code
   * @returns {Promise} Partner details
   */
  getBusinessPartner: async function(cardCode) {
    return this.get(`StoreBusinessPartners/${cardCode}`);
  },

  /**
   * Get business partner statements
   * @param {string} cardCode - Customer card code
   * @param {object} data - Statement query data (startDate, endDate, currency)
   * @returns {Promise} Statement data
   */
  getBusinessPartnerStatements: async function(cardCode, data) {
    return this.post(`StoreJournalEntries/BusinessPartners/${cardCode}/GetStatements`, data);
  }
};

// Make it available globally
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}

// Export for module systems (CommonJS/ES6)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}
