import { createContext, useContext, useState, useEffect } from 'react';
import { Business, CashbookEntry, Transfer, Customer, DueEntry, Product, Sale, Purchase, StockItem, Supplier } from '../types';

interface DataContextType {
  businesses: Business[];
  cashbookEntries: CashbookEntry[];
  transfers: Transfer[];
  customers: Customer[];
  dueEntries: DueEntry[];
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  stockItems: StockItem[];
  suppliers: Supplier[];
  
  // Business operations
  addBusiness: (business: Omit<Business, 'id' | 'createdAt'>) => void;
  updateBusiness: (id: string, business: Partial<Business>) => void;
  deleteBusiness: (id: string) => void;
  
  // Cashbook operations
  addCashbookEntry: (entry: Omit<CashbookEntry, 'id' | 'createdAt'>) => void;
  
  // Transfer operations
  initiateTransfer: (transfer: Omit<Transfer, 'id' | 'initiatedAt'>) => void;
  processTransfer: (id: string, action: 'accept' | 'reject', processedBy: string) => void;
  
  // Customer operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalDue'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  
  // Product operations
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  
  // Sale operations
  addSale: (sale: Omit<Sale, 'id' | 'createdAt'>) => void;
  
  // Purchase operations
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  
  // Stock operations
  addStockItem: (stockItem: Omit<StockItem, 'id' | 'createdAt'>) => void;
  updateStockItem: (id: string, stockItem: Partial<StockItem>) => void;
  
  // Due operations
  addDuePayment: (dueId: string, payment: Omit<DueEntry['payments'][0], 'id'>) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Initial demo data
const DEMO_BUSINESSES: Business[] = [
  {
    id: 'business-1',
    name: 'ABC Electronics',
    description: 'Electronics and gadgets store',
    address: '123 Main Street, City',
    phone: '+1234567890',
    email: 'contact@abc-electronics.com',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
  {
    id: 'business-2',
    name: 'XYZ Textiles',
    description: 'Textile and clothing business',
    address: '456 Commerce Ave, City',
    phone: '+0987654321',
    email: 'info@xyz-textiles.com',
    createdAt: new Date().toISOString(),
    isActive: true,
  },
];

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [cashbookEntries, setCashbookEntries] = useState<CashbookEntry[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [dueEntries, setDueEntries] = useState<DueEntry[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  useEffect(() => {
    // Load data from localStorage or initialize with demo data
    const storedBusinesses = localStorage.getItem('cashbook_businesses');
    if (storedBusinesses) {
      setBusinesses(JSON.parse(storedBusinesses));
    } else {
      setBusinesses(DEMO_BUSINESSES);
      localStorage.setItem('cashbook_businesses', JSON.stringify(DEMO_BUSINESSES));
    }

    const storedCashbook = localStorage.getItem('cashbook_entries');
    if (storedCashbook) {
      setCashbookEntries(JSON.parse(storedCashbook));
    }

    const storedTransfers = localStorage.getItem('cashbook_transfers');
    if (storedTransfers) {
      setTransfers(JSON.parse(storedTransfers));
    }

    const storedCustomers = localStorage.getItem('cashbook_customers');
    if (storedCustomers) {
      setCustomers(JSON.parse(storedCustomers));
    }

    const storedDues = localStorage.getItem('cashbook_dues');
    if (storedDues) {
      setDueEntries(JSON.parse(storedDues));
    }

    const storedProducts = localStorage.getItem('cashbook_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    }

    const storedSales = localStorage.getItem('cashbook_sales');
    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }

    const storedPurchases = localStorage.getItem('cashbook_purchases');
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }

    const storedStock = localStorage.getItem('cashbook_stock');
    if (storedStock) {
      setStockItems(JSON.parse(storedStock));
    }

    const storedSuppliers = localStorage.getItem('cashbook_suppliers');
    if (storedSuppliers) {
      setSuppliers(JSON.parse(storedSuppliers));
    }
  }, []);

  const addBusiness = (businessData: Omit<Business, 'id' | 'createdAt'>) => {
    const newBusiness: Business = {
      ...businessData,
      id: `business-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);
    localStorage.setItem('cashbook_businesses', JSON.stringify(updatedBusinesses));
  };

  const updateBusiness = (id: string, businessData: Partial<Business>) => {
    const updatedBusinesses = businesses.map(b => 
      b.id === id ? { ...b, ...businessData } : b
    );
    setBusinesses(updatedBusinesses);
    localStorage.setItem('cashbook_businesses', JSON.stringify(updatedBusinesses));
  };

  const deleteBusiness = (id: string) => {
    const updatedBusinesses = businesses.filter(b => b.id !== id);
    setBusinesses(updatedBusinesses);
    localStorage.setItem('cashbook_businesses', JSON.stringify(updatedBusinesses));
  };

  const addCashbookEntry = (entryData: Omit<CashbookEntry, 'id' | 'createdAt'>) => {
    const newEntry: CashbookEntry = {
      ...entryData,
      id: `entry-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedEntries = [...cashbookEntries, newEntry];
    setCashbookEntries(updatedEntries);
    localStorage.setItem('cashbook_entries', JSON.stringify(updatedEntries));
  };

  const initiateTransfer = (transferData: Omit<Transfer, 'id' | 'initiatedAt'>) => {
    const newTransfer: Transfer = {
      ...transferData,
      id: `transfer-${Date.now()}`,
      initiatedAt: new Date().toISOString(),
    };
    const updatedTransfers = [...transfers, newTransfer];
    setTransfers(updatedTransfers);
    localStorage.setItem('cashbook_transfers', JSON.stringify(updatedTransfers));
  };

  const processTransfer = (id: string, action: 'accept' | 'reject', processedBy: string) => {
    const updatedTransfers = transfers.map(t => {
      if (t.id === id) {
        const updatedTransfer = {
          ...t,
          status: action === 'accept' ? 'accepted' as const : 'rejected' as const,
          processedBy,
          processedAt: new Date().toISOString(),
        };

        // If accepted, create cashbook entries
        if (action === 'accept') {
          const outflowEntry: CashbookEntry = {
            id: `entry-${Date.now()}-out`,
            businessId: t.fromBusinessId,
            date: new Date().toISOString(),
            type: 'outflow',
            category: 'transfer_out',
            mode: t.mode,
            amount: t.amount,
            description: `Transfer to ${businesses.find(b => b.id === t.toBusinessId)?.name}: ${t.description}`,
            transferId: t.id,
            createdBy: processedBy,
            createdAt: new Date().toISOString(),
          };

          const inflowEntry: CashbookEntry = {
            id: `entry-${Date.now()}-in`,
            businessId: t.toBusinessId,
            date: new Date().toISOString(),
            type: 'inflow',
            category: 'transfer_in',
            mode: t.mode,
            amount: t.amount,
            description: `Transfer from ${businesses.find(b => b.id === t.fromBusinessId)?.name}: ${t.description}`,
            transferId: t.id,
            createdBy: processedBy,
            createdAt: new Date().toISOString(),
          };

          const updatedEntries = [...cashbookEntries, outflowEntry, inflowEntry];
          setCashbookEntries(updatedEntries);
          localStorage.setItem('cashbook_entries', JSON.stringify(updatedEntries));
        }

        return updatedTransfer;
      }
      return t;
    });
    
    setTransfers(updatedTransfers);
    localStorage.setItem('cashbook_transfers', JSON.stringify(updatedTransfers));
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalDue'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: `customer-${Date.now()}`,
      totalPurchases: 0,
      totalDue: 0,
      createdAt: new Date().toISOString(),
    };
    const updatedCustomers = [...customers, newCustomer];
    setCustomers(updatedCustomers);
    localStorage.setItem('cashbook_customers', JSON.stringify(updatedCustomers));
  };

  const updateCustomer = (id: string, customerData: Partial<Customer>) => {
    const updatedCustomers = customers.map(c => 
      c.id === id ? { ...c, ...customerData } : c
    );
    setCustomers(updatedCustomers);
    localStorage.setItem('cashbook_customers', JSON.stringify(updatedCustomers));
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `product-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('cashbook_products', JSON.stringify(updatedProducts));
  };

  const updateProduct = (id: string, productData: Partial<Product>) => {
    const updatedProducts = products.map(p => 
      p.id === id ? { ...p, ...productData } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('cashbook_products', JSON.stringify(updatedProducts));
  };

  const addSale = (saleData: Omit<Sale, 'id' | 'createdAt'>) => {
    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedSales = [...sales, newSale];
    setSales(updatedSales);
    localStorage.setItem('cashbook_sales', JSON.stringify(updatedSales));

    // Create cashbook entries for cash and bank payments separately
    if (saleData.cashAmount && saleData.cashAmount > 0) {
      addCashbookEntry({
        businessId: saleData.businessId,
        date: saleData.saleDate,
        type: 'inflow',
        category: 'sale',
        mode: 'cash',
        amount: saleData.cashAmount,
        description: `Cash sale payment from ${customers.find(c => c.id === saleData.customerId)?.name}`,
        customerId: saleData.customerId,
        productId: saleData.productId,
        createdBy: saleData.createdBy,
      });
    }

    if (saleData.bankAmount && saleData.bankAmount > 0) {
      addCashbookEntry({
        businessId: saleData.businessId,
        date: saleData.saleDate,
        type: 'inflow',
        category: 'sale',
        mode: 'bank',
        amount: saleData.bankAmount,
        description: `Bank sale payment from ${customers.find(c => c.id === saleData.customerId)?.name}`,
        customerId: saleData.customerId,
        productId: saleData.productId,
        createdBy: saleData.createdBy,
      });
    }

    if (saleData.financeAmount && saleData.financeAmount > 0) {
      addCashbookEntry({
        businessId: saleData.businessId,
        date: saleData.saleDate,
        type: 'inflow',
        category: 'sale',
        mode: 'bajaj_finserv',
        amount: saleData.financeAmount,
        description: `Finance sale payment from ${customers.find(c => c.id === saleData.customerId)?.name}`,
        customerId: saleData.customerId,
        productId: saleData.productId,
        createdBy: saleData.createdBy,
      });
    }

    // Create due entry if there's outstanding amount
    if (saleData.dueAmount > 0) {
      const payments = [];
      
      if (saleData.cashAmount && saleData.cashAmount > 0) {
        payments.push({
          id: `payment-${Date.now()}-cash`,
          amount: saleData.cashAmount,
          mode: 'cash' as const,
          date: saleData.saleDate,
          description: 'Initial cash payment',
        });
      }
      
      if (saleData.bankAmount && saleData.bankAmount > 0) {
        payments.push({
          id: `payment-${Date.now()}-bank`,
          amount: saleData.bankAmount,
          mode: 'bank' as const,
          date: saleData.saleDate,
          description: 'Initial bank payment',
        });
      }
      
      if (saleData.financeAmount && saleData.financeAmount > 0) {
        payments.push({
          id: `payment-${Date.now()}-finance`,
          amount: saleData.financeAmount,
          mode: 'bajaj_finserv' as const,
          date: saleData.saleDate,
          description: 'Initial finance payment',
        });
      }

      const newDueEntry: DueEntry = {
        id: `due-${Date.now()}`,
        businessId: saleData.businessId,
        customerId: saleData.customerId,
        productId: saleData.productId,
        totalAmount: saleData.totalAmount,
        paidAmount: saleData.paidAmount,
        dueAmount: saleData.dueAmount,
        saleDate: saleData.saleDate,
        payments,
        createdAt: new Date().toISOString(),
      };
      
      const updatedDues = [...dueEntries, newDueEntry];
      setDueEntries(updatedDues);
      localStorage.setItem('cashbook_dues', JSON.stringify(updatedDues));
    }

    // Update customer totals
    const customer = customers.find(c => c.id === saleData.customerId);
    if (customer) {
      updateCustomer(customer.id, {
        totalPurchases: customer.totalPurchases + saleData.totalAmount,
        totalDue: customer.totalDue + saleData.dueAmount,
      });
    }

    // Add stock out entry
    addStockItem({
      businessId: saleData.businessId,
      productId: saleData.productId,
      quantity: saleData.quantity,
      type: 'out',
      reason: 'Sale',
      date: saleData.saleDate,
      createdBy: saleData.createdBy,
    });
  };

  const addPurchase = (purchaseData: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchaseData,
      id: `purchase-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('cashbook_purchases', JSON.stringify(updatedPurchases));

    // Create cashbook entry for payment made
    if (purchaseData.paidAmount > 0) {
      addCashbookEntry({
        businessId: purchaseData.businessId,
        date: purchaseData.purchaseDate,
        type: 'outflow',
        category: 'expense',
        mode: purchaseData.mode,
        amount: purchaseData.paidAmount,
        description: `Purchase payment for ${products.find(p => p.id === purchaseData.productId)?.name}`,
        productId: purchaseData.productId,
        createdBy: purchaseData.createdBy,
      });
    }

    // Add stock in entry
    addStockItem({
      businessId: purchaseData.businessId,
      productId: purchaseData.productId,
      quantity: purchaseData.quantity,
      type: 'in',
      reason: 'Purchase',
      date: purchaseData.purchaseDate,
      createdBy: purchaseData.createdBy,
    });
  };

  const addStockItem = (stockData: Omit<StockItem, 'id' | 'createdAt'>) => {
    const newStockItem: StockItem = {
      ...stockData,
      id: `stock-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updatedStock = [...stockItems, newStockItem];
    setStockItems(updatedStock);
    localStorage.setItem('cashbook_stock', JSON.stringify(updatedStock));
  };

  const updateStockItem = (id: string, stockData: Partial<StockItem>) => {
    const updatedStock = stockItems.map(s => 
      s.id === id ? { ...s, ...stockData } : s
    );
    setStockItems(updatedStock);
    localStorage.setItem('cashbook_stock', JSON.stringify(updatedStock));
  };

  const addDuePayment = (dueId: string, paymentData: Omit<DueEntry['payments'][0], 'id'>) => {
    const updatedDues = dueEntries.map(due => {
      if (due.id === dueId) {
        const newPayment = {
          ...paymentData,
          id: `payment-${Date.now()}`,
        };
        
        const updatedDue = {
          ...due,
          paidAmount: due.paidAmount + paymentData.amount,
          dueAmount: due.dueAmount - paymentData.amount,
          payments: [...due.payments, newPayment],
        };

        // Create cashbook entry for the payment
        addCashbookEntry({
          businessId: due.businessId,
          date: paymentData.date,
          type: 'inflow',
          category: 'due_collection',
          mode: paymentData.mode,
          amount: paymentData.amount,
          description: `Due collection from ${customers.find(c => c.id === due.customerId)?.name}`,
          customerId: due.customerId,
          createdBy: 'system', // Should be actual user
        });

        // Update customer due total
        const customer = customers.find(c => c.id === due.customerId);
        if (customer) {
          updateCustomer(customer.id, {
            totalDue: customer.totalDue - paymentData.amount,
          });
        }

        return updatedDue;
      }
      return due;
    });
    
    setDueEntries(updatedDues);
    localStorage.setItem('cashbook_dues', JSON.stringify(updatedDues));
  };

  return (
    <DataContext.Provider value={{
      businesses,
      cashbookEntries,
      transfers,
      customers,
      dueEntries,
      products,
      sales,
      purchases,
      stockItems,
      suppliers,
      addBusiness,
      updateBusiness,
      deleteBusiness,
      addCashbookEntry,
      initiateTransfer,
      processTransfer,
      addCustomer,
      updateCustomer,
      addProduct,
      updateProduct,
      addSale,
      addPurchase,
      addStockItem,
      updateStockItem,
      addDuePayment,
    }}>
      {children}
    </DataContext.Provider>
  );
}