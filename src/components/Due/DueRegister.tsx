import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Receipt, Plus, DollarSign, Calendar, User, Package } from 'lucide-react';

export function DueRegister() {
  const { user } = useAuth();
  const { businesses, customers, products, dueEntries, addDuePayment } = useData();
  const [selectedBusiness, setSelectedBusiness] = useState('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedDue, setSelectedDue] = useState('');
  const [paymentData, setPaymentData] = useState({
    amount: '',
    mode: 'cash' as 'cash' | 'bank' | 'bajaj_finserv',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const filteredDues = dueEntries.filter(due => 
    (!selectedBusiness || due.businessId === selectedBusiness) && due.dueAmount > 0
  );

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDue) {
      addDuePayment(selectedDue, {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
      });
      setPaymentData({
        amount: '',
        mode: 'cash',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
      setSelectedDue('');
      setShowPaymentForm(false);
    }
  };

  const openPaymentForm = (dueId: string) => {
    setSelectedDue(dueId);
    setShowPaymentForm(true);
  };

  const totalDueAmount = filteredDues.reduce((sum, due) => sum + due.dueAmount, 0);
  const totalPaidAmount = filteredDues.reduce((sum, due) => sum + due.paidAmount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Due Register</h1>
          <p className="text-gray-600 mt-1">Track and manage customer due payments</p>
        </div>
      </div>

      {/* Due Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">₹{totalDueAmount.toLocaleString()}</p>
            </div>
            <Receipt className="h-8 w-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-700 mt-2">₹{totalPaidAmount.toLocaleString()}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Active Dues</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{filteredDues.length}</p>
            </div>
            <Receipt className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Collection Rate</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">
                {totalPaidAmount + totalDueAmount > 0 
                  ? Math.round((totalPaidAmount / (totalPaidAmount + totalDueAmount)) * 100)
                  : 0}%
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-purple-600" />
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

      {/* Payment Form */}
      {showPaymentForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Record Payment</h2>
            <button
              onClick={() => setShowPaymentForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Amount *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                max={dueEntries.find(d => d.id === selectedDue)?.dueAmount}
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Mode *</label>
              <select
                required
                value={paymentData.mode}
                onChange={(e) => setPaymentData({ ...paymentData, mode: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
                <option value="bajaj_finserv">Bajaj Finserv</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
              <input
                type="date"
                required
                value={paymentData.date}
                onChange={(e) => setPaymentData({ ...paymentData, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                value={paymentData.description}
                onChange={(e) => setPaymentData({ ...paymentData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Payment description"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Record Payment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Due Entries List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Outstanding Dues ({filteredDues.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDues.map((due) => {
                const customer = customers.find(c => c.id === due.customerId);
                const business = businesses.find(b => b.id === due.businessId);
                const product = products.find(p => p.id === due.productId);
                
                return (
                  <tr key={due.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{customer?.name}</div>
                          <div className="text-sm text-gray-500">{customer?.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {business?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{product?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span>{new Date(due.saleDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{due.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      ₹{due.paidAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-orange-600">
                      ₹{due.dueAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openPaymentForm(due.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add Payment</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredDues.length === 0 && (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No outstanding dues</h3>
              <p className="text-gray-600">All payments are up to date!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}