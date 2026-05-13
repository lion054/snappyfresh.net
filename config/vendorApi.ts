import { apiTransport } from './apiTransport';

// ==================== VENDOR ITEMS ====================

async function getVendorItems() {
  return apiTransport.get('VendorItems');
}

async function getVendorItem(itemCode: string) {
  return apiTransport.get(`VendorItems/${itemCode}`);
}

async function getPreferredVendorItems() {
  return apiTransport.get('VendorItems/Preferred');
}

async function updateVendorItem(itemCode: string, payload: any) {
  return apiTransport.put(`VendorItems/${itemCode}`, payload);
}

// ==================== VENDOR INVOICES ====================

async function getVendorInvoices(limit = 20, page = 1) {
  return apiTransport.get('VendorInvoices', { pageSize: String(limit), pageNumber: String(page) });
}

async function getVendorInvoice(docEntry: number) {
  return apiTransport.get(`VendorInvoices/${docEntry}`);
}

// ==================== VENDOR PAYMENTS ====================

async function getVendorPayments(limit = 20, page = 1) {
  return apiTransport.get('VendorPayments', { pageSize: String(limit), pageNumber: String(page) });
}

async function getVendorPayment(docEntry: number) {
  return apiTransport.get(`VendorPayments/${docEntry}`);
}

async function cancelVendorPayment(docEntry: number) {
  return apiTransport.post(`VendorPayments/${docEntry}/Cancel`);
}

// ==================== VENDOR STATEMENTS ====================

async function getVendorStatementList() {
  return apiTransport.get('VendorStatements');
}

async function getVendorStatement(cardCode: string, fromDate?: string, toDate?: string, schedule?: string) {
  const params: Record<string, string> = {};
  if (fromDate) params['FromDate'] = fromDate;
  if (toDate) params['ToDate'] = toDate;
  if (schedule) params['Schedule'] = schedule;
  const res = await apiTransport.get(`VendorStatements/Vendors/${cardCode}`, params);
  return {
    openingBalance: res?.transactions?.openBalance || 0,
    closingBalance: res?.transactions?.closingBalance || 0,
    aging: res?.transactions?.aging || null,
    vendor: res?.vendor || null,
    transactions: (res?.transactions?.journalEntries || []).map((je: any) => ({
      date: je.refDate || je.dueDate,
      reference: je.transId,
      description: je.lineMemo,
      debit: je.debit,
      credit: je.credit,
      balance: je.balance,
    })),
  };
}

async function sendVendorStatement(cardCode: string, payload: any) {
  return apiTransport.post(`VendorStatements/Vendors/${cardCode}/Send`, payload);
}

// ==================== PURCHASE DELIVERY NOTES (GRV/GRPO) ====================

async function getVendorDeliveryNotes(limit = 20, page = 1) {
  return apiTransport.get('VendorPurchaseDeliveryNotes', { pageSize: String(limit), pageNumber: String(page) });
}

async function getVendorDeliveryNote(docEntry: number) {
  return apiTransport.get(`VendorPurchaseDeliveryNotes/${docEntry}`);
}

async function createVendorDeliveryNote(payload: any) {
  return apiTransport.post('VendorPurchaseDeliveryNotes', payload);
}

// ==================== PURCHASE RETURNS ====================

async function getVendorPurchaseReturns(limit = 20, page = 1) {
  return apiTransport.get('VendorPurchaseReturns', { pageSize: String(limit), pageNumber: String(page) });
}

async function getVendorPurchaseReturn(docEntry: number) {
  return apiTransport.get(`VendorPurchaseReturns/${docEntry}`);
}

async function createVendorPurchaseReturn(payload: any) {
  return apiTransport.post('VendorPurchaseReturns', payload);
}

export const vendorApi = {
  // Items
  getVendorItems,
  getVendorItem,
  getPreferredVendorItems,
  updateVendorItem,
  // Invoices
  getVendorInvoices,
  getVendorInvoice,
  // Payments
  getVendorPayments,
  getVendorPayment,
  cancelVendorPayment,
  // Statements
  getVendorStatementList,
  getVendorStatement,
  sendVendorStatement,
  // Delivery Notes (GRPO)
  getVendorDeliveryNotes,
  getVendorDeliveryNote,
  createVendorDeliveryNote,
  // Purchase Returns
  getVendorPurchaseReturns,
  getVendorPurchaseReturn,
  createVendorPurchaseReturn,
};
