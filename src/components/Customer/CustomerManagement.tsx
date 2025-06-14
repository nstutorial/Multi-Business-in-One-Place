import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Users, Plus, Edit2, Phone, Mail, DollarSign, Receipt } from 'lucide-react';
import { Customer } from '../../types';

export function CustomerManagement() {
  const { user } = useAuth();
  const { businesses, customers, addCustomer, updateCustomer, dueEntries } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [formData, setFormData] = useState({
    businessId: '',
    name: '',
    mobile: '',
    email: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredCustomers = customers.filter(customer => 
    !selectedBusiness || customer.businessId === selectedBusiness
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      setEditingCustomer(null);
    } else {
      addCustomer(formData);
    }
    setFormData({ businessId: '', name: '', mobile: '', email: '' });
    setShowAddForm(false);
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormData({
      businessId: customer.businessId,
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || '',
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({ businessId: '', name: '', mobile: '', email: '' });
    setEditingCustomer(null);
    setShowAddForm(false);
  };

  const getCustomerDues = (customerId: string) => {
    return dueEntries.filter(due => due.customerId === customerId);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600 mt-1">Manage your business customers and their information</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Customer</span>
        </button>
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

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Customers</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{filteredCustomers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Purchases</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                ₹{filteredCustomers.reduce((sum, c) => sum + c.totalPurchases, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Due</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">
                ₹{filteredCustomers.reduce((sum, c) => sum + c.totalDue, 0).toLocaleString()}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Dues</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                {dueEntries.filter(due => due.dueAmount > 0 && 
                  filteredCustomers.some(c => c.id === due.customerId)).length}
              </p>
            </div>
            <Receipt className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Add/Edit Customer Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number *</label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+1234567890"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email (Optional)</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="customer@example.com"
              />
            </div>
            
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
                {editingCustomer ? 'Update Customer' : 'Add Customer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Customers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Customers ({filteredCustomers.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Purchases</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {businesses.find(b => b.id === customer.businessId)?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{customer.mobile}</span>
                      </div>
                      {customer.email && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{customer.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                    ₹{customer.totalPurchases.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${
                      customer.totalDue > 0 ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      ₹{customer.totalDue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleEdit(customer)}
                      className="text-blue-600 hover:text-blue-900 flex items-center space-x-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
              <p className="text-gray-600">Add your first customer to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}