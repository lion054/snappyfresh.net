/**
 * Snappy Fresh - Order, Payment & Scheduled Orders API
 * Covers invoices, payments (PayNow, InnBucks), and delivery schedule endpoints.
 */

import { logger } from '../lib/logger';
import { apiTransport } from './apiTransport';

// ==================== ORDER/INVOICE ENDPOINTS ====================

/**
 * Get store invoices
 */
async function getStoreInvoices(pageSize: any = 20, pageNumber: any = 1, filterExtension: any = '', queryExtension: any = '') {
  const params = {
    queryExtension,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
    filterExtension
  };
  return await apiTransport.get('StoreInvoices', params);
}

/**
 * Get single invoice by DocEntry
 */
async function getSingleInvoice(docEntry: any, selectExtension: any = '') {
  const params = { selectExtension };
  return await apiTransport.get(`StoreInvoices/${docEntry}`, params);
}

/**
 * Get user orders (invoices)
 */
async function getUserOrders(pageSize: any = 20, pageNumber: any = 1) {
  return await getStoreInvoices(pageSize, pageNumber);
}

/**
 * Get order details
 */
async function getOrder(docEntry: any) {
  return await getSingleInvoice(docEntry);
}

// ==================== PAYMENT ENDPOINTS ====================

/**
 * Get incoming payments
 */
async function getIncomingPayments(pageSize: any = 20, pageNumber: any = 1, filterExtension: any = '', queryExtension: any = '') {
  const params = {
    queryExtension,
    pageSize: pageSize.toString(),
    pageNumber: pageNumber.toString(),
    filterExtension
  };
  return await apiTransport.get('StoreIncomingPayments', params);
}

/**
 * Create incoming payment
 */
async function createIncomingPayment(payload: any) {
  return await apiTransport.post('StoreIncomingPayments', payload);
}

/**
 * Initialize PayNow payment
 */
async function createOrderPayNow(payload: any) {
  return await apiTransport.post('StoreIncomingPayments/PayNow/InitiatePayment', payload);
}

/**
 * Get InnBucks payment code
 */
async function createOrderApiInnBucks(payload: any) {
  return await apiTransport.post('StoreIncomingPayments/InnBucks/GetPaymentCode', payload);
}

// ==================== SCHEDULED ORDERS ENDPOINTS ====================

/**
 * Get all scheduled orders for the current user
 * Returns delivery schedules that the user can place orders for
 */
async function getStoreOrderSchedules(pageSize: number = 100, pageNumber: number = 1) {
  const endpointStrategies = [
    'StoreOrderSchedules/Available',  // Primary: Get available schedules
    'StoreOrderSchedules',             // Secondary: Get all schedules
    'StoreOrders/Schedules',           // Fallback
    'ScheduledOrders',                 // Fallback
    'Orders/Schedules',                // Fallback
  ];

  let lastError: any = null;

  for (const endpoint of endpointStrategies) {
    try {
      logger.debug(`[StoreOrderSchedules] Attempting endpoint: ${endpoint}`);
      const response = await apiTransport.get(endpoint, {
        pageSize: pageSize.toString(),
        pageNumber: pageNumber.toString(),
      });

      if (response) {
        const schedules = Array.isArray(response)
          ? response
          : response.values || response.data || response.schedules || [];

        // Success: return schedules even if empty
        if (Array.isArray(schedules) || Array.isArray(response)) {
          logger.info(`[StoreOrderSchedules] Successfully retrieved from ${endpoint}: ${schedules.length || 0} items`);
          return Array.isArray(response) ? response : schedules;
        }
      }
    } catch (error: any) {
      lastError = error;
      logger.debug(`[StoreOrderSchedules] Endpoint ${endpoint} failed:`, error?.message);
    }
  }

  logger.warn('[StoreOrderSchedules] All endpoints failed. Last error:', lastError?.message);
  return [];
}

/**
 * Get all scheduled orders placed by the current user
 * Returns orders that were placed within delivery schedules
 */
async function getScheduledOrders(pageSize: number = 100, pageNumber: number = 1) {
  const endpointStrategies = [
    'StoreScheduledOrders',           // Primary: Get all orders for current customer
    'StoreOrders/Scheduled',          // Fallback
    'Orders/Scheduled',               // Fallback
    'ScheduledOrders/List',           // Fallback
  ];

  let lastError: any = null;

  for (const endpoint of endpointStrategies) {
    try {
      logger.debug(`[ScheduledOrders] Attempting endpoint: ${endpoint}`);
      const response = await apiTransport.get(endpoint, {
        pageSize: pageSize.toString(),
        pageNumber: pageNumber.toString(),
      });

      if (response) {
        const orders = Array.isArray(response)
          ? response
          : response.values || response.data || response.orders || [];

        // Success: return even if empty
        if (Array.isArray(orders) || Array.isArray(response)) {
          logger.info(`[ScheduledOrders] Successfully retrieved from ${endpoint}: ${orders.length || 0} items`);
          return Array.isArray(response) ? response : orders;
        }
      }
    } catch (error: any) {
      lastError = error;
      logger.debug(`[ScheduledOrders] Endpoint ${endpoint} failed:`, error?.message);
    }
  }

  logger.warn('[ScheduledOrders] All endpoints failed. Last error:', lastError?.message);
  return [];
}

/**
 * Create a cart for a scheduled order.
 * Validates the schedule is open, delivery date is valid, and recalculates prices.
 * POST StoreScheduledOrders/Cart
 */
async function createScheduledOrderCart(payload: any) {
  logger.debug('[ScheduledOrders] Creating cart:', { scheduleDocEntry: payload?.ScheduleDocEntry, lines: payload?.DocumentLines?.length });
  const response = await apiTransport.post('StoreScheduledOrders/Cart', payload);
  logger.info('[ScheduledOrders] Cart created:', { cartId: response?.CartId || response?.cartId });
  return response;
}

/**
 * Create a scheduled order from a cart. Payment method is COD.
 * POST StoreScheduledOrders/Order
 */
async function createScheduledOrder(payload: any) {
  logger.debug('[ScheduledOrders] Creating order from cart:', { cartId: payload?.CartId || payload?.cartId });
  const response = await apiTransport.post('StoreScheduledOrders/Order', payload);
  logger.info('[ScheduledOrders] Order created:', { docNum: response?.DocNum || response?.docNum, docEntry: response?.DocEntry || response?.docEntry });
  return response;
}

/**
 * Get a specific scheduled order by DocEntry.
 * GET StoreScheduledOrders/{id}
 */
async function getScheduledOrder(id: any) {
  logger.debug('[ScheduledOrders] Fetching order:', { id });
  const response = await apiTransport.get(`StoreScheduledOrders/${id}`);
  return response;
}

export const orderApi = {
  getStoreInvoices,
  getSingleInvoice,
  getUserOrders,
  getOrder,
  getIncomingPayments,
  createIncomingPayment,
  createOrderPayNow,
  createOrderApiInnBucks,
  getStoreOrderSchedules,
  getScheduledOrders,
  createScheduledOrderCart,
  createScheduledOrder,
  getScheduledOrder,
};
