/**
 * Normalize inconsistent API response shapes from SAP Business One.
 * This eliminates the duplicated response normalization pattern across 6+ files.
 */

export const normalizeArray = (response: any) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.values)) return response.values;
  if (Array.isArray(response?.Values)) return response.Values;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.Data)) return response.Data;
  if (Array.isArray(response?.message)) return response.message;
  if (Array.isArray(response?.result)) return response.result;
  return [];
};

export const normalizeInvoice = (inv: any) => ({
  id: inv.DocNum || inv.docNum || inv.DocEntry || inv.docEntry,
  docEntry: inv.DocEntry || inv.docEntry,
  docNum: inv.DocNum || inv.docNum,
  date: inv.DocDate || inv.docDate,
  dueDate: inv.DocDueDate || inv.docDueDate,
  items: (inv.DocumentLines || inv.documentLines || []).length,
  amount: inv.DocTotal || inv.docTotal || 0,
  amountSys: inv.DocTotalSys || inv.DocTotal || inv.docTotal || 0,
  status: (inv.DocStatus || inv.docStatus) === 'O' ? 'Open' : 'Closed',
  statusRaw: inv.DocStatus || inv.docStatus,
  supplier: inv.CardName || inv.cardName || '',
  poNumber: inv.NumAtCard || inv.numAtCard || '',
  paidToDate: (inv.PaidToDate || inv.paidToDate) ?? null,
  cardName: inv.CardName || inv.cardName || '',
});

export const normalizeScheduledOrder = (so: any) => {
  // Handle SalesPersonOrderModel (U_ prefixed fields) and regular formats
  const lines = so.ONA_SPOR1Collection || so.ona_SPOR1Collection || so.DocumentLines || so.documentLines || [];
  return {
    id: so.DocNum || so.docNum || so.DocEntry || so.docEntry,
    docEntry: so.DocEntry || so.docEntry,
    docNum: so.DocNum || so.docNum,
    date: so.U_DocumentDate || so.u_DocumentDate || so.CreateDate || so.createDate || so.DocDate || so.docDate,
    deliveryDate: so.U_DeliveryDate || so.u_DeliveryDate || so.DeliveryDate || so.deliveryDate || so.startDeliveryDate,
    items: lines.length,
    amount: so.U_DocTotal || so.u_DocTotal || so.DocTotal || so.docTotal || 0,
    status: so.U_Status || so.u_Status || so.Status || so.status || 'Ordered',
    paymentStatus: so.U_PaymentStatus || so.u_PaymentStatus || 'Pending',
    supplier: so.U_CardName || so.u_CardName || so.CardName || so.cardName || '',
    poNumber: so.NumAtCard || so.numAtCard || '',
    type: 'scheduled'
  };
};
