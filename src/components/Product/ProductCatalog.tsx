import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Package, Plus, Edit2, Trash2, DollarSign, Tag } from 'lucide-react';
import { Product } from '../../types';

export function ProductCatalog() {
  const { user } = useAuth();
  const { businesses, products, addProduct, updateProduct } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    description: '',
    price: '',
    cost: '',
    category: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredProducts = products.filter(product => 
    (!selectedBusiness || product.businessId === selectedBusiness) && product.isActive
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      cost: parseFloat(formData.cost),
      isActive: true,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      setEditingProduct(null);
    } else {
      addProduct(productData);
    }
    
    setFormData({
      businessId: '',
      name: '',
      description: '',
      price: '',
      cost: '',
      category: '',
    });
    setShowAddForm(false);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      businessId: product.businessId,
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      cost: product.cost.toString(),
      category: product.category,
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      updateProduct(id, { isActive: false });
    }
  };

  const resetForm = () => {
    setFormData({
      businessId: '',
      name: '',
      description: '',
      price: '',
      cost: '',
      category: '',
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog</h1>
          <p className="text-gray-600 mt-1">Manage your business products and pricing</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'business_manager') && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Products</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{filteredProducts.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Avg. Price</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                ₹{filteredProducts.length > 0 
                  ? Math.round(filteredProducts.reduce((sum, p) => sum + p.price, 0) / filteredProducts.length)
                  : 0}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Categories</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">{categories.length}</p>
            </div>
            <Tag className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Avg. Margin</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">
                {filteredProducts.length > 0 
                  ? Math.round(filteredProducts.reduce((sum, p) => sum + ((p.price - p.cost) / p.price * 100), 0) / filteredProducts.length)
                  : 0}%
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-orange-600" />
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

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button
              onClick={resetForm}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product category"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter product description"
              />
            </div>
            
            {formData.price && formData.cost && (
              <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Profit Margin:</span>
                  <span className="text-lg font-bold text-green-600">
                    ₹{(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)} 
                    ({((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.price) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            )}
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {product.category}
                  </span>
                </div>
              </div>
              {(user?.role === 'admin' || user?.role === 'business_manager') && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{product.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Selling Price:</span>
                <span className="text-lg font-bold text-green-600">₹{product.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cost Price:</span>
                <span className="text-sm font-medium text-gray-900">₹{product.cost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Profit Margin:</span>
                <span className="text-sm font-bold text-blue-600">
                  ₹{(product.price - product.cost).toLocaleString()} 
                  ({((product.price - product.cost) / product.price * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Business: {businesses.find(b => b.id === product.businessId)?.name}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h2>
          <p className="text-gray-600 mb-4">Add your first product to get started</p>
          {(user?.role === 'admin' || user?.role === 'business_manager') && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Add First Product
            </button>
          )}
        </div>
      )}
    </div>
  );
}