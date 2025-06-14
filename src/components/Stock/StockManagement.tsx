import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Package, Plus, Minus, AlertTriangle, TrendingUp, TrendingDown, Search } from 'lucide-react';

export function StockManagement() {
  const { user } = useAuth();
  const { businesses, products, stockItems, addStockItem, updateStockItem } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    businessId: '',
    productId: '',
    quantity: '',
    type: 'in' as 'in' | 'out',
    reason: '',
    date: new Date().toISOString().split('T')[0],
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredStockItems = stockItems?.filter(item => {
    const product = products.find(p => p.id === item.productId);
    const business = businesses.find(b => b.id === item.businessId);
    
    const businessMatch = !selectedBusiness || item.businessId === selectedBusiness;
    const searchMatch = !searchTerm || 
      product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return businessMatch && searchMatch;
  }) || [];

  const businessProducts = products.filter(p => p.businessId === formData.businessId && p.isActive);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (addStockItem) {
      addStockItem({
        ...formData,
        quantity: parseInt(formData.quantity),
        createdBy: user?.id || '',
      });
    }
    
    setFormData({
      businessId: '',
      productId: '',
      quantity: '',
      type: 'in',
      reason: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const getStockLevel = (productId: string) => {
    const stockMovements = stockItems?.filter(item => item.productId === productId) || [];
    return stockMovements.reduce((total, movement) => {
      return movement.type === 'in' ? total + movement.quantity : total - movement.quantity;
    }, 0);
  };

  const getStockStatus = (currentStock: number, minStock: number = 10) => {
    if (currentStock <= 0) return { status: 'out-of-stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (currentStock <= minStock) return { status: 'low-stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'in-stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const totalProducts = filteredStockItems.length;
  const lowStockProducts = filteredStockItems.filter(item => {
    const currentStock = getStockLevel(item.productId);
    return currentStock <= 10 && currentStock > 0;
  }).length;
  const outOfStockProducts = filteredStockItems.filter(item => {
    const currentStock = getStockLevel(item.productId);
    return currentStock <= 0;
  }).length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage product inventory levels</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Stock Movement</span>
        </button>
      </div>

      {/* Stock Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">In Stock</p>
              <p className="text-2xl font-bold text-green-700 mt-2">{totalProducts - lowStockProducts - outOfStockProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Low Stock</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">{lowStockProducts}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-700 mt-2">{outOfStockProducts}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Filter by Business:</label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Businesses</option>
              {userBusinesses.map(business => (
                <option key={business.id} value={business.id}>{business.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-700">Search Products:</label>
            <div className="relative mt-1">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by product name..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Add Stock Movement Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Record Stock Movement</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Product *</label>
              <select
                required
                value={formData.productId}
                onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!formData.businessId}
              >
                <option value="">Select Product</option>
                {businessProducts.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="in">Stock In (Add)</option>
                <option value="out">Stock Out (Remove)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Purchase, Sale, Damage, etc."
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
                Record Movement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stock Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Stock Overview</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.filter(product => {
                const businessMatch = !selectedBusiness || product.businessId === selectedBusiness;
                const searchMatch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
                return businessMatch && searchMatch && product.isActive;
              }).map((product) => {
                const currentStock = getStockLevel(product.id);
                const stockStatus = getStockStatus(currentStock);
                const business = businesses.find(b => b.id === product.businessId);
                const lastMovement = stockItems?.filter(item => item.productId === product.id)
                  .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())[0];
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {business?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {currentStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.status === 'out-of-stock' && 'Out of Stock'}
                        {stockStatus.status === 'low-stock' && 'Low Stock'}
                        {stockStatus.status === 'in-stock' && 'In Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lastMovement ? new Date(lastMovement.createdAt || '').toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {products.filter(product => {
            const businessMatch = !selectedBusiness || product.businessId === selectedBusiness;
            const searchMatch = !searchTerm || product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return businessMatch && searchMatch && product.isActive;
          }).length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Add products to start tracking stock</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}