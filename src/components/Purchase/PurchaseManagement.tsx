import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ShoppingBag, Plus, Calendar, User, Package, DollarSign, Truck } from 'lucide-react';

export function PurchaseManagement() {
  const { user } = useAuth();
  const { businesses, products, purchases, addPurchase, suppliers } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [formData, setFormData] = useState({
    businessId: '',
    supplierId: '',
    productId: '',
    quantity: '1',
    unitCost: '',
    totalAmount: '',
    paidAmount: '',
    dueAmount: '',
    mode: 'cash' as 'cash' | 'bank' | 'bajaj_finserv',
    purchaseDate: new Date().toISOString().split('T')[0],
    invoiceNumber: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredPurchases = purchases?.filter(purchase => 
    !selectedBusiness || purchase.businessId === selectedBusiness
  ) || [];

  const businessProducts = products.filter(p => p.businessId === formData.businessId && p.isActive);

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const quantity = parseInt(formData.quantity) || 1;
      const totalAmount = product.cost * quantity;
      setFormData({
        ...formData,
        productId,
        unitCost: product.cost.toString(),
        totalAmount: totalAmount.toString(),
        paidAmount: totalAmount.toString(),
        dueAmount: '0',
      });
    }
  };

  const handleQuantityChange = (quantity: string) => {
    const qty = parseInt(quantity) || 1;
    const unitCost = parseFloat(formData.unitCost) || 0;
    const totalAmount = unitCost * qty;
    const paidAmount = parseFloat(formData.paidAmount) || 0;
    const dueAmount = Math.max(0, totalAmount - paidAmount);
    
    setFormData({
      ...formData,
      quantity,
      totalAmount: totalAmount.toString(),
      dueAmount: dueAmount.toString(),
    });
  };

  const handlePaidAmountChange = (paidAmount: string) => {
    const paid = parseFloat(paidAmount) || 0;
    const total = parseFloat(formData.totalAmount) || 0;
    const due = Math.max(0, total - paid);
    
    setFormData({
      ...formData,
      paidAmount,
      dueAmount: due.toString(),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addPurchase) {
      addPurchase({
        ...formData,
        quantity: parseInt(formData.quantity),
        unitCost: parseFloat(formData.unitCost),
        totalAmount: parseFloat(formData.totalAmount),
        paidAmount: parseFloat(formData.paidAmount),
        dueAmount: parseFloat(formData.dueAmount),
        createdBy: user?.id || '',
      });
    }
    
    setFormData({
      businessId: '',
      supplierId: '',
      productId: '',
      quantity: '1',
      unitCost: '',
      totalAmount: '',
      paidAmount: '',
      dueAmount: '',
      mode: 'cash',
      purchaseDate: new Date().toISOString().split('T')[0],
      invoiceNumber: '',
    });
    setShowAddForm(false);
  };

  const totalPurchaseAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);
  const totalPaidAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.paidAmount, 0);
  const totalDueAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.dueAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          <p className="text-gray-600 mt-1">Track and manage product purchases from suppliers</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Purchase</span>
        </button>
      </div>

      {/* Purchase Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Purchases</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">₹{totalPurchaseAmount.toLocaleString()}</p>
            </div>
            <ShoppingBag className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Amount Paid</p>
              <p className="text-2xl font-bold text-green-700 mt-2">₹{totalPaidAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
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
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Orders</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">{filteredPurchases.length}</p>
            </div>
            <Truck className="h-8 w-8 text-purple-600" />
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

      {/* Add Purchase Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Record New Purchase</h2>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="INV-001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => handleProductChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.businessId}
              >
                <option value="">Select Product</option>
                {businessProducts.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₹{product.cost}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalAmount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                max={formData.totalAmount}
                value={formData.paidAmount}
                onChange={(e) => handlePaidAmountChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Amount</label>
              <input
                type="number"
                step="0.01"
                value={formData.dueAmount}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
              <select
                required
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="bajaj_finserv">Bajaj Finserv</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
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
                Record Purchase
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Purchases List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Purchase History ({filteredPurchases.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime()).map((purchase) => {
                const product = products.find(p => p.id === purchase.productId);
                
                return (
                  <tr key={purchase.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.invoiceNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{purchase.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{purchase.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={purchase.dueAmount > 0 ? 'text-orange-600' : 'text-gray-500'}>
                        ₹{purchase.dueAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {purchase.mode}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredPurchases.length === 0 && (
            <div className="text-center py-12">
              <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases recorded</h3>
              <p className="text-gray-600">Record your first purchase to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}