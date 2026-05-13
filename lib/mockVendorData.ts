/**
 * Showcase-mode mock data for the vendor portal.
 * When SHOWCASE_MODE is true in config/api.ts, vendor API methods return these
 * instead of hitting the ERP. Shapes match what the pages expect.
 */

export const SHOWCASE_MODE = false;

export const MOCK_VENDOR = {
  token: 'showcase-token',
  customer: {
    cardCode: 'V10001',
    cardName: 'Yomilk (Pvt) Ltd',
    emailAddress: 'vendor@yomilk.com',
    phone1: '+263 77 123 4567',
    cardType: 'S',
  },
};

const today = new Date();
const daysAgo = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() - d);
  return x.toISOString().split('T')[0];
};
const daysAhead = (d: number) => {
  const x = new Date(today);
  x.setDate(x.getDate() + d);
  return x.toISOString().split('T')[0];
};

export const MOCK_ITEMS = [
  { itemCode: 'YM-MILK-1L', itemName: 'Yomilk Whole Milk 1L', price: 2.5, costPrice: 1.6, quantityOnStock: 420, quantityOrderedByCustomers: 45, itemsGroupCode: 101, salesUnit: 'BOTTLE', frozenFor: 'tNO', maxInventory: 500 },
  { itemCode: 'YM-MILK-500', itemName: 'Yomilk Whole Milk 500ml', price: 1.4, costPrice: 0.9, quantityOnStock: 180, quantityOrderedByCustomers: 22, itemsGroupCode: 101, salesUnit: 'BOTTLE', frozenFor: 'tNO', maxInventory: 300 },
  { itemCode: 'YM-LOWFAT-1L', itemName: 'Yomilk Low-Fat Milk 1L', price: 2.7, costPrice: 1.7, quantityOnStock: 95, quantityOrderedByCustomers: 12, itemsGroupCode: 101, salesUnit: 'BOTTLE', frozenFor: 'tNO', maxInventory: 250 },
  { itemCode: 'YM-YOG-500', itemName: 'Yomilk Natural Yogurt 500g', price: 3.2, costPrice: 2.0, quantityOnStock: 64, quantityOrderedByCustomers: 8, itemsGroupCode: 102, salesUnit: 'TUB', frozenFor: 'tNO', maxInventory: 150 },
  { itemCode: 'YM-YOG-STRAW', itemName: 'Yomilk Strawberry Yogurt 150g', price: 1.1, costPrice: 0.65, quantityOnStock: 210, quantityOrderedByCustomers: 30, itemsGroupCode: 102, salesUnit: 'POT', frozenFor: 'tNO', maxInventory: 400 },
  { itemCode: 'YM-BUTTER-250', itemName: 'Yomilk Salted Butter 250g', price: 4.5, costPrice: 3.1, quantityOnStock: 7, quantityOrderedByCustomers: 3, itemsGroupCode: 103, salesUnit: 'PACK', frozenFor: 'tNO', maxInventory: 120 },
  { itemCode: 'YM-CHEESE-200', itemName: 'Yomilk Cheddar Cheese 200g', price: 5.8, costPrice: 4.0, quantityOnStock: 38, quantityOrderedByCustomers: 5, itemsGroupCode: 103, salesUnit: 'PACK', frozenFor: 'tNO', maxInventory: 100 },
  { itemCode: 'YM-CREAM-250', itemName: 'Yomilk Fresh Cream 250ml', price: 2.9, costPrice: 1.9, quantityOnStock: 0, quantityOrderedByCustomers: 0, itemsGroupCode: 103, salesUnit: 'BOTTLE', frozenFor: 'tNO', maxInventory: 80 },
  { itemCode: 'YM-MAAS-500', itemName: 'Yomilk Sour Milk (Maas) 500ml', price: 1.8, costPrice: 1.1, quantityOnStock: 156, quantityOrderedByCustomers: 19, itemsGroupCode: 101, salesUnit: 'BOTTLE', frozenFor: 'tNO', maxInventory: 300 },
  { itemCode: 'YM-ICECREAM-1L', itemName: 'Yomilk Vanilla Ice Cream 1L', price: 6.5, costPrice: 4.2, quantityOnStock: 22, quantityOrderedByCustomers: 4, itemsGroupCode: 104, salesUnit: 'TUB', frozenFor: 'tNO', maxInventory: 80 },
  { itemCode: 'YM-DISCONTINUED', itemName: 'Yomilk Discontinued Flavour', price: 2.0, costPrice: 1.3, quantityOnStock: 3, quantityOrderedByCustomers: 0, itemsGroupCode: 104, salesUnit: 'BOTTLE', frozenFor: 'tYES', maxInventory: 50 },
];

const customers = ['Fresh Mart Avondale', 'Bon Marché Borrowdale', 'OK Mart Westgate', 'Food World Eastlea', 'SPAR Sam Levy', 'TM PnP Eastgate', 'Local Grocer Mbare', 'Harare Central Market'];

const makeInvoice = (i: number) => {
  const dayOffset = i * 2 + Math.floor(Math.random() * 3);
  const docTotal = Math.round((120 + Math.random() * 880) * 100) / 100;
  const isClosed = i % 3 === 0;
  const isCancelled = i === 9;
  const paid = isClosed ? docTotal : isCancelled ? 0 : Math.round(docTotal * 0.4 * 100) / 100;
  return {
    docEntry: 4100 + i,
    docNum: 10200 + i,
    cardCode: `C${1000 + (i % customers.length)}`,
    cardName: customers[i % customers.length],
    docTotal,
    paidToDate: paid,
    docDate: daysAgo(dayOffset),
    docDueDate: daysAhead(14 - dayOffset),
    documentStatus: isClosed ? 'bost_Close' : 'bost_Open',
    cancelled: isCancelled ? 'tYES' : 'tNO',
  };
};

const ALL_INVOICES = Array.from({ length: 32 }, (_, i) => makeInvoice(i));

export const mockGetVendorInvoices = (limit = 20, page = 1) => {
  const start = (page - 1) * limit;
  const slice = ALL_INVOICES.slice(start, start + limit);
  return {
    values: slice,
    recordCount: ALL_INVOICES.length,
    pageCount: Math.ceil(ALL_INVOICES.length / limit),
  };
};

export const mockGetVendorInvoice = (docEntry: number) => {
  const inv = ALL_INVOICES.find((x) => x.docEntry === docEntry) || ALL_INVOICES[0]!;
  const lineCount = 2 + (docEntry % 3);
  const lines = Array.from({ length: lineCount }, (_, i) => {
    const item = MOCK_ITEMS[(docEntry + i) % MOCK_ITEMS.length]!;
    const qty = 5 + ((docEntry + i) % 20);
    return {
      itemCode: item.itemCode,
      itemDescription: item.itemName,
      quantity: qty,
      unitPrice: item.price,
      lineTotal: Math.round(item.price * qty * 100) / 100,
    };
  });
  return { ...inv, documentLines: lines };
};

export const mockGetVendorItems = () => MOCK_ITEMS;

const makePayment = (i: number) => ({
  docEntry: 7200 + i,
  docNum: 15300 + i,
  docTotal: Math.round((800 + Math.random() * 3200) * 100) / 100,
  cashSum: 0,
  transferAccount: i % 2 === 0 ? 'CBZ Bank – ****4512' : 'Stanbic – ****8821',
  docDate: daysAgo(i * 5 + 1),
  reference1: `PAY-${202604000 + i}`,
  cancelled: 'tNO',
});

const ALL_PAYMENTS = Array.from({ length: 14 }, (_, i) => makePayment(i));

export const mockGetVendorPayments = (_limit = 50, _page = 1) => ({
  values: ALL_PAYMENTS,
  recordCount: ALL_PAYMENTS.length,
});

export const mockGetVendorStatement = (_cardCode: string) => {
  let balance = 4200;
  const opening = balance;
  const transactions = Array.from({ length: 12 }, (_, i) => {
    const isCredit = i % 2 === 0;
    const amount = Math.round((300 + Math.random() * 1800) * 100) / 100;
    if (isCredit) balance += amount;
    else balance -= amount;
    return {
      date: daysAgo(45 - i * 3),
      reference: `TXN-${90000 + i}`,
      description: isCredit ? `Invoice #${10200 + i} – Sale` : `Payment received – ${10200 + i}`,
      debit: isCredit ? amount : 0,
      credit: isCredit ? 0 : amount,
      balance: Math.round(balance * 100) / 100,
    };
  });
  return {
    openingBalance: opening,
    closingBalance: Math.round(balance * 100) / 100,
    transactions,
  };
};

export const mockUpdateVendorItem = async (_id: string, _payload: any) => ({ success: true });
export const mockSetPassword = async (_payload: any) => ({ success: true });
