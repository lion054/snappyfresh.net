/**
 * Snappy Fresh - Auth & Business Partner API
 * Covers login, registration, profile, password, and partner-switching endpoints.
 */

import { logger } from '../lib/logger';
import { apiTransport } from './apiTransport';

// ==================== AUTH ENDPOINTS ====================

/**
 * Login user (Business Partner)
 */
async function login(email: any, password: any) {
  // Ensure we have a guest session first to get the database name
  await apiTransport.ensureSession();

  // Get the database name from existing auth user
  const authUser = apiTransport.getAuthUser();
  const companyDB = authUser?.databaseName || 'CORKED_SPIN_NEW'; // Fallback to known DB

  const payload = {
    companyDB: companyDB,
    username: email,  // API expects 'username' field, not 'email'
    password: password,
    // Note: API may require an 'auth' field (possibly CAPTCHA) - needs investigation
  };

  const response = await apiTransport.post('Auths/Login/BusinessPartners', payload);

  if (response.token) {
    // Fetch full business partner details to enrich user data
    try {
      const cardCode = response.customer?.cardCode;
      if (cardCode) {
        logger.debug('Fetching full business partner details after login');
        const fullDetails = await apiTransport.get(`StoreBusinessPartners/${cardCode}`);

        // Merge full details into customer object
        if (fullDetails) {
          response.customer = {
            ...response.customer,
            email: fullDetails.email || fullDetails.emailAddress || fullDetails.Email || fullDetails.EmailAddress || response.customer?.email,
            emailAddress: fullDetails.email || fullDetails.emailAddress || fullDetails.Email || fullDetails.EmailAddress || response.customer?.email,
            phone: fullDetails.phone1 || fullDetails.phone || fullDetails.Phone1 || fullDetails.Phone || response.customer?.phone,
            phone1: fullDetails.phone1 || fullDetails.phone || fullDetails.Phone1 || fullDetails.Phone || response.customer?.phone,
            phone2: fullDetails.phone2 || fullDetails.Phone2 || response.customer?.phone2,
            address: fullDetails.address || fullDetails.Address || response.customer?.address,
            city: fullDetails.city || fullDetails.City || response.customer?.city,
            state: fullDetails.state || fullDetails.State || response.customer?.state,
            country: fullDetails.country || fullDetails.Country || response.customer?.country,
            postalCode: fullDetails.postalCode || fullDetails.PostalCode || fullDetails.zipCode || fullDetails.ZipCode || response.customer?.postalCode,
            faxNumber: fullDetails.faxNumber || fullDetails.FaxNumber || response.customer?.faxNumber
          };
        }
      }
    } catch (error: any) {
      logger.warn('Could not fetch full business partner details after login:', error?.message);
      // Continue anyway - we have basic auth response
    }

    apiTransport.saveAuthUser(response);
    apiTransport.sessionInitialized = true;
  }

  return response;
}

/**
 * Register new user
 */
async function register(userData: any) {
  return await apiTransport.post('ExternalUsers/Register', userData);
}

/**
 * Register complete customer with details
 */
async function registerCompleteCustomer(userData: any) {
  return await apiTransport.post('StoreBusinessPartners/StoreCustomers/Register', userData);
}

/**
 * Get user profile (Business Partner details)
 */
async function getProfile() {
  const authUser = apiTransport.getAuthUser();
  if (authUser && authUser.customer?.cardCode) {
    return await apiTransport.get(`StoreBusinessPartners/${authUser.customer.cardCode}`);
  }
  throw new Error('No user logged in');
}

/**
 * Logout user
 */
function logout() {
  apiTransport.clearToken();
  apiTransport.sessionInitialized = false;
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/**
 * Verify registration via email link (token-based)
 */
async function verifyRegistration(email: any, token: any) {
  return await apiTransport.get('ExternalUsers/Verify', { email, token });
}

/**
 * Forgot password - Get OTP
 */
async function forgotPassword(emailAddress: any) {
  return await apiTransport.post('ExternalUsers/ResetPassword/GetOtp', { emailAddress });
}

/**
 * Reset password with OTP
 */
async function resetPassword(email: any, otp: any, newPassword: any, confirmPassword: any) {
  const payload = {
    email,
    otp,
    newPassword,
    confirmNewPassword: confirmPassword
  };
  return await apiTransport.post('ExternalUsers/ResetPassword', payload);
}

// ==================== BUSINESS PARTNER ENDPOINTS ====================

/**
 * Get business partner details
 */
async function getBusinessPartnerDetails(cardCode: any, selectExtension: any = '') {
  const params = { selectExtension };
  return await apiTransport.get(`StoreBusinessPartners/${cardCode}`, params);
}

/**
 * Get store statements
 */
async function getStoreStatements(cardCode: any, currency: any = 'Account', startDate: any = '2000-10-25T03:10:52.946Z', endDate: any = new Date().toISOString()) {
  const payload = {
    startDate,
    endDate,
    currency
  };
  return await apiTransport.post(`StoreJournalEntries/BusinessPartners/${cardCode}/GetStatements`, payload);
}

// ==================== ACCOUNT SWITCHING ENDPOINTS ====================

/**
 * Get all business partners for the current user
 * This fetches the list of available profiles the user can switch to
 * Tries multiple endpoint strategies for compatibility
 */
async function getUserBusinessPartners() {
  try {
    const response = await apiTransport.get('ExternalUsers/BusinessPartners');
    const partners = Array.isArray(response) ? response : [];
    logger.info(`[BusinessPartners] Retrieved ${partners.length} partners`);
    return partners;
  } catch (error: any) {
    // Guest sessions have no external user — treat as empty list, not an error
    const msg = (error?.message || '').toLowerCase();
    if (error?.status === 400 || msg.includes('no external user')) {
      return [];
    }
    logger.error('[BusinessPartners] Error getting business partners:', error?.message);
    throw error;
  }
}

/**
 * Switch to a different business partner profile
 * This re-authenticates the user with a different business partner context
 */
async function switchBusinessPartner(cardCode: string) {
  try {
    if (!cardCode) throw new Error('Card code is required');

    logger.info(`Switching to business partner: ${cardCode}`);

    const switchResponse = await apiTransport.get(`Auths/BusinessPartners/${cardCode}/Switch`);

    if (!switchResponse?.token) {
      throw new Error(`Failed to switch to business partner ${cardCode}: no token received`);
    }

    apiTransport.saveAuthUser(switchResponse);
    logger.info(`Successfully switched to ${cardCode}`);
    return switchResponse;
  } catch (error: any) {
    const status = error?.status || error?.statusCode;
    const msg = error?.message || '';
    if (status === 403 || msg.includes('do not have access')) {
      throw new Error(`You do not have access to business partner ${cardCode}`);
    }
    if (status === 401 || msg.includes('expired')) {
      throw new Error('Your session has expired. Please log in again.');
    }
    logger.error('Error switching business partner:', error);
    throw error;
  }
}

// ==================== VENDOR/SUPPLIER ENDPOINTS ====================

/**
 * Submit vendor/supplier application
 * Posts to Next.js API route which sends email to operations@snappyfresh.net
 * Uses the frontend email handler with nodemailer
 */
async function submitVendorApplication(formData: FormData) {
  try {
    logger.debug('[VendorApplication] Submitting vendor application');

    // Call the Next.js API route (not the backend API)
    const response = await fetch('/api/vendor-signup', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type - let browser set it for FormData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const result = await response.json();
    logger.info('[VendorApplication] Successfully submitted');
    return result;
  } catch (error: any) {
    logger.error('[VendorApplication] Submission failed:', error.message);
    throw error;
  }
}

export const authApi = {
  login,
  register,
  registerCompleteCustomer,
  getProfile,
  logout,
  verifyRegistration,
  forgotPassword,
  resetPassword,
  getBusinessPartnerDetails,
  getStoreStatements,
  getUserBusinessPartners,
  switchBusinessPartner,
  submitVendorApplication,
};
