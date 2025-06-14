export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'business_manager' | 'staff';
  assignedBusinesses: string[];
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  createdAt: string;
  isActive: boolean;
}

export interface CashbookEntry {
  id: string;
  businessId: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: 'sale' | 'expense' | 'due_collection' | 'transfer_in' | 'transfer_out' | 'other';
  mode: 'cash' | 'bank' | 'bajaj_finserv';
  amount: number;
  description: string;
  customerId?: string;
  productId?: string;
  transferId?: string;
  createdBy: string;
  createdAt: string;
}

export interface Transfer {
  id: string;
  fromBusinessId: string;
  toBusinessId: string;
  amount: number;
  mode: 'cash' | 'bank' | 'bajaj_finserv';
  description: string;
  status: 'pending' | 'accepted' | 'rejected';
  initiatedBy: string;
  initiatedAt: string;
  processedBy?: string;
  processedAt?: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  mobile: string;
  email?: string;
  totalPurchases: number;
  totalDue: number;
  createdAt: string;
}

export interface DueEntry {
  id: string;
  businessId: string;
  customerId: string;
  productId: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  saleDate: string;
  payments: DuePayment[];
  createdAt: string;
}

export interface DuePayment {
  id: string;
  amount: number;
  mode: 'cash' | 'bank' | 'bajaj_finserv';
  date: string;
  description?: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  category: string;
  isActive: boolean;
  createdAt: string;
}

export interface Sale {
  id: string;
  businessId: string;
  customerId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  cashAmount?: number;
  bankAmount?: number;
  financeAmount?: number;
  mode: 'cash' | 'bank' | 'bajaj_finserv';
  saleDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Purchase {
  id: string;
  businessId: string;
  supplierId?: string;
  productId: string;
  quantity: number;
  unitCost: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  mode: 'cash' | 'bank' | 'bajaj_finserv';
  purchaseDate: string;
  invoiceNumber?: string;
  createdBy: string;
  createdAt?: string;
}

export interface StockItem {
  id: string;
  businessId: string;
  productId: string;
  quantity: number;
  type: 'in' | 'out';
  reason: string;
  date: string;
  createdBy: string;
  createdAt?: string;
}

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  mobile: string;
  email?: string;
  address?: string;
  createdAt: string;
}