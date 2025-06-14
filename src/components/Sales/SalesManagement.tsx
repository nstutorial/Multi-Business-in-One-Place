import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { BarChart3, Plus, ShoppingCart, User, Package, DollarSign, X, Search } from 'lucide-react';

interface ProductItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface PaymentModes {
  cash: number;
  bank: number;
  finance: number;
}

export function SalesManagement() {
  const { user } = useAuth();
  const { businesses, customers, products, sales, addSale } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  
  // Customer auto-suggestion states
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  
  // Product items array for multiple products
  const [productItems, setProductItems] = useState<ProductItem[]>([
    { id: '1', productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  
  // Payment modes
  const [paymentModes, setPaymentModes] = useState<PaymentModes>({
    cash: 0,
    bank: 0,
    finance: 0
  });
  
  const [formData, setFormData] = useState({
    businessId: '',
    saleDate: new Date().toISOString().split('T')[0],
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredSales = sales.filter(sale => 
    !selectedBusiness || sale.businessId === selectedBusiness
  );

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer => 
    customer.businessId === formData.businessId &&
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // Filter products based on search for each item
  const getFilteredProducts = (searchTerm: string) => {
    return products.filter(product => 
      product.businessId === formData.businessId && 
      product.isActive &&
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Add new product item
  const addProductItem = () => {
    const newItem: ProductItem = {
      id: Date.now().toString(),
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    setProductItems([...productItems, newItem]);
  };

  // Remove product item
  const removeProductItem = (id: string) => {
    if (productItems.length > 1) {
      setProductItems(productItems.filter(item => item.id !== id));
    }
  };

  // Update product item
  const updateProductItem = (id: string, field: keyof ProductItem, value: any) => {
    setProductItems(productItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If product is selected, update price
        if (field === 'productId') {
          const product = products.find(p => p.id === value);
          if (product) {
            updatedItem.productName = product.name;
            updatedItem.unitPrice = product.price;
            updatedItem.total = updatedItem.quantity * product.price;
          }
        }
        
        // If quantity changes, recalculate total
        if (field === 'quantity') {
          updatedItem.total = updatedItem.unitPrice * value;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = productItems.reduce((sum, item) => sum + item.total, 0);
    const totalPaid = paymentModes.cash + paymentModes.bank + paymentModes.finance;
    const dueAmount = Math.max(0, subtotal - totalPaid);
    
    return { subtotal, totalPaid, dueAmount };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCustomer || productItems.length === 0) {
      alert('Please select a customer and add at least one product');
      return;
    }

    const { subtotal, totalPaid, dueAmount } = calculateTotals();
    
    // Create individual sale entries for each product
    productItems.forEach(item => {
      if (item.productId && item.quantity > 0) {
        // Calculate proportional payment for this item
        const itemRatio = item.total / subtotal;
        const itemCashPayment = paymentModes.cash * itemRatio;
        const itemBankPayment = (paymentModes.bank + paymentModes.finance) * itemRatio;
        const itemTotalPayment = itemCashPayment + itemBankPayment;
        const itemDue = item.total - itemTotalPayment;

        addSale({
          businessId: formData.businessId,
          customerId: selectedCustomer.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalAmount: item.total,
          paidAmount: itemTotalPayment,
          dueAmount: Math.max(0, itemDue),
          cashAmount: itemCashPayment,
          bankAmount: itemBankPayment,
          financeAmount: paymentModes.finance * itemRatio,
          mode: itemCashPayment > 0 ? 'cash' : 'bank', // Primary mode
          saleDate: formData.saleDate,
          createdBy: user?.id || '',
        });
      }
    });
    
    // Reset form
    setFormData({
      businessId: '',
      saleDate: new Date().toISOString().split('T')[0],
    });
    setSelectedCustomer(null);
    setCustomerSearch('');
    setProductItems([{ id: '1', productId: '', productName: '', quantity: 1, unitPrice: 0, total: 0 }]);
    setPaymentModes({ cash: 0, bank: 0, finance: 0 });
    setShowAddForm(false);
  };

  // Calculate cash and bank balances separately
  const calculateBalances = () => {
    const cashInflow = filteredSales.reduce((sum, sale) => sum + (sale.cashAmount || 0), 0);
    const bankInflow = filteredSales.reduce((sum, sale) => sum + ((sale.bankAmount || 0) + (sale.financeAmount || 0)), 0);
    
    return { cashBalance: cashInflow, bankBalance: bankInflow };
  };

  const { cashBalance, bankBalance } = calculateBalances();
  const totalSalesAmount = filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalPaidAmount = filteredSales.reduce((sum, sale) => sum + sale.paidAmount, 0);
  const totalDueAmount = filteredSales.reduce((sum, sale) => sum + sale.dueAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          <p className="text-gray-600 mt-1">Record and track product sales with multiple payment modes</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Sale</span>
        </button>
      </div>

      {/* Enhanced Sales Stats with Cash/Bank Split */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Sales</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">₹{totalSalesAmount.toLocaleString()}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Cash Balance</p>
              <p className="text-2xl font-bold text-green-700 mt-2">₹{cashBalance.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Bank Balance</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">₹{bankBalance.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Outstanding Due</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">₹{totalDueAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-indigo-600">Total Orders</p>
              <p className="text-2xl font-bold text-indigo-700 mt-2">{filteredSales.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Business Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Filter by Business:</label>
          <select
            value={selectedBusiness}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Businesses</option>
            {userBusinesses.map(business => (
              <option key={business.id} value={business.id}>{business.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Enhanced Add Sale Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Record New Sale</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business *</label>
                <select
                  required
                  value={formData.businessId}
                  onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Business</option>
                  {userBusinesses.map(business => (
                    <option key={business.id} value={business.id}>{business.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Date *</label>
                <input
                  type="date"
                  required
                  value={formData.saleDate}
                  onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Customer Auto-suggestion */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer *</label>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={selectedCustomer ? selectedCustomer.name : customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setSelectedCustomer(null);
                    setShowCustomerSuggestions(true);
                  }}
                  onFocus={() => setShowCustomerSuggestions(true)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search customer by name..."
                  disabled={!formData.businessId}
                />
              </div>
              
              {/* Customer Suggestions */}
              {showCustomerSuggestions && customerSearch && !selectedCustomer && filteredCustomers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCustomers.slice(0, 5).map(customer => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setCustomerSearch('');
                        setShowCustomerSuggestions(false);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">{customer.mobile}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Products</h3>
                <button
                  type="button"
                  onClick={addProductItem}
                  className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Product</span>
                </button>
              </div>

              {productItems.map((item, index) => (
                <ProductItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  products={getFilteredProducts('')}
                  onUpdate={updateProductItem}
                  onRemove={removeProductItem}
                  canRemove={productItems.length > 1}
                />
              ))}
            </div>

            {/* Payment Modes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cash Payment</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentModes.cash}
                    onChange={(e) => setPaymentModes({ ...paymentModes, cash: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Payment</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentModes.bank}
                    onChange={(e) => setPaymentModes({ ...paymentModes, bank: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Finance Payment</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={paymentModes.finance}
                    onChange={(e) => setPaymentModes({ ...paymentModes, finance: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Subtotal:</span>
                  <div className="font-bold text-gray-900">₹{calculateTotals().subtotal.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Paid:</span>
                  <div className="font-bold text-green-600">₹{calculateTotals().totalPaid.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Due Amount:</span>
                  <div className="font-bold text-orange-600">₹{calculateTotals().dueAmount.toLocaleString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">Items:</span>
                  <div className="font-bold text-gray-900">{productItems.filter(item => item.productId).length}</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Record Sale
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sales List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Sales History ({filteredSales.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cash</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSales.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((sale) => {
                const customer = customers.find(c => c.id === sale.customerId);
                const product = products.find(p => p.id === sale.productId);
                
                return (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{customer?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{sale.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{(sale.cashAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      ₹{((sale.bankAmount || 0) + (sale.financeAmount || 0)).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={sale.dueAmount > 0 ? 'text-orange-600' : 'text-gray-500'}>
                        ₹{sale.dueAmount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sales recorded</h3>
              <p className="text-gray-600">Record your first sale to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Product Item Row Component
interface ProductItemRowProps {
  item: ProductItem;
  index: number;
  products: any[];
  onUpdate: (id: string, field: keyof ProductItem, value: any) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

function ProductItemRow({ item, index, products, onUpdate, onRemove, canRemove }: ProductItemRowProps) {
  const [productSearch, setProductSearch] = useState(item.productName);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
      {/* Product Auto-suggestion */}
      <div className="md:col-span-2 relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product {index + 1} *
        </label>
        <div className="relative">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
          <input
            type="text"
            required
            value={item.productId ? item.productName : productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              if (item.productId) {
                onUpdate(item.id, 'productId', '');
                onUpdate(item.id, 'productName', '');
                onUpdate(item.id, 'unitPrice', 0);
                onUpdate(item.id, 'total', 0);
              }
              setShowProductSuggestions(true);
            }}
            onFocus={() => setShowProductSuggestions(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="Search product..."
          />
        </div>
        
        {/* Product Suggestions */}
        {showProductSuggestions && productSearch && !item.productId && filteredProducts.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
            {filteredProducts.slice(0, 5).map(product => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onUpdate(item.id, 'productId', product.id);
                  onUpdate(item.id, 'productName', product.name);
                  onUpdate(item.id, 'unitPrice', product.price);
                  onUpdate(item.id, 'total', product.price * item.quantity);
                  setProductSearch('');
                  setShowProductSuggestions(false);
                }}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                <div className="font-medium text-gray-900 text-sm">{product.name}</div>
                <div className="text-xs text-gray-500">₹{product.price}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={(e) => onUpdate(item.id, 'quantity', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
      </div>

      {/* Unit Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
        <input
          type="number"
          step="0.01"
          value={item.unitPrice}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
        />
      </div>

      {/* Total */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Total</label>
        <input
          type="number"
          step="0.01"
          value={item.total}
          readOnly
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-medium"
        />
      </div>

      {/* Remove Button */}
      <div className="flex items-end">
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}