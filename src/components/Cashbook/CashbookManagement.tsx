import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DollarSign, Plus, Filter, Download, ArrowUpRight, ArrowDownLeft, Calendar, Tag } from 'lucide-react';
import { CashbookEntry } from '../../types';

export function CashbookManagement() {
  const { user } = useAuth();
  const { businesses, cashbookEntries, addCashbookEntry, customers, products } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMode, setFilterMode] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  
  const [formData, setFormData] = useState({
    businessId: '',
    date: new Date().toISOString().split('T')[0],
    type: 'inflow' as 'inflow' | 'outflow',
    category: 'other',
    mode: 'cash' as 'cash' | 'bank' | 'bajaj_finserv',
    amount: '',
    description: '',
    customerId: '',
    productId: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredEntries = cashbookEntries.filter(entry => {
    const businessMatch = !selectedBusiness || entry.businessId === selectedBusiness;
    const typeMatch = filterType === 'all' || entry.type === filterType;
    const categoryMatch = filterCategory === 'all' || entry.category === filterCategory;
    const modeMatch = filterMode === 'all' || entry.mode === filterMode;
    const dateMatch = (!dateRange.start || entry.date >= dateRange.start) && 
                     (!dateRange.end || entry.date <= dateRange.end);
    
    return businessMatch && typeMatch && categoryMatch && modeMatch && dateMatch;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCashbookEntry({
      ...formData,
      amount: parseFloat(formData.amount),
      customerId: formData.customerId || undefined,
      productId: formData.productId || undefined,
      createdBy: user?.id || '',
    });
    setFormData({
      businessId: '',
      date: new Date().toISOString().split('T')[0],
      type: 'inflow',
      category: 'other',
      mode: 'cash',
      amount: '',
      description: '',
      customerId: '',
      productId: '',
    });
    setShowAddForm(false);
  };

  const calculateBalance = () => {
    const inflow = filteredEntries
      .filter(entry => entry.type === 'inflow')
      .reduce((sum, entry) => sum + entry.amount, 0);
    const outflow = filteredEntries
      .filter(entry => entry.type === 'outflow')
      .reduce((sum, entry) => sum + entry.amount, 0);
    return { inflow, outflow, net: inflow - outflow };
  };

  const balance = calculateBalance();

  const getCategoryColor = (category: string) => {
    const colors = {
      sale: 'bg-green-100 text-green-800',
      expense: 'bg-red-100 text-red-800',
      due_collection: 'bg-blue-100 text-blue-800',
      transfer_in: 'bg-purple-100 text-purple-800',
      transfer_out: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getModeColor = (mode: string) => {
    const colors = {
      cash: 'bg-emerald-100 text-emerald-700',
      bank: 'bg-blue-100 text-blue-700',
      bajaj_finserv: 'bg-indigo-100 text-indigo-700',
    };
    return colors[mode as keyof typeof colors] || colors.cash;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cashbook Management</h1>
          <p className="text-gray-600 mt-1">Track all cash inflow and outflow transactions</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Inflow</p>
              <p className="text-2xl font-bold text-green-700 mt-2">₹{balance.inflow.toLocaleString()}</p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Outflow</p>
              <p className="text-2xl font-bold text-red-700 mt-2">₹{balance.outflow.toLocaleString()}</p>
            </div>
            <ArrowDownLeft className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className={`${balance.net >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} rounded-xl p-6 border`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${balance.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Net Balance</p>
              <p className={`text-2xl font-bold mt-2 ${balance.net >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ₹{balance.net.toLocaleString()}
              </p>
            </div>
            <DollarSign className={`h-8 w-8 ${balance.net >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Business</label>
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Businesses</option>
              {userBusinesses.map(business => (
                <option key={business.id} value={business.id}>{business.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="inflow">Inflow</option>
              <option value="outflow">Outflow</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="sale">Sale</option>
              <option value="expense">Expense</option>
              <option value="due_collection">Due Collection</option>
              <option value="transfer_in">Transfer In</option>
              <option value="transfer_out">Transfer Out</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Modes</option>
              <option value="cash">Cash</option>
              <option value="bank">Bank</option>
              <option value="bajaj_finserv">Bajaj Finserv</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Add Transaction Form */}
      {showAddForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Add New Transaction</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="inflow">Inflow (Money In)</option>
                <option value="outflow">Outflow (Money Out)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="sale">Sale</option>
                <option value="expense">Expense</option>
                <option value="due_collection">Due Collection</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="other">Other</option>
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter transaction description"
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
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Transactions ({filteredEntries.length})
            </h3>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(entry.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {businesses.find(b => b.id === entry.businessId)?.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      {entry.type === 'inflow' ? (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-red-600" />
                      )}
                      <span>{entry.description}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                      {entry.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModeColor(entry.mode)}`}>
                      {entry.mode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <span className={entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'}>
                      {entry.type === 'inflow' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEntries.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
              <p className="text-gray-600">Add your first transaction to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}