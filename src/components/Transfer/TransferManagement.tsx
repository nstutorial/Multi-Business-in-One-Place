import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ArrowRightLeft, Plus, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { Transfer } from '../../types';

export function TransferManagement() {
  const { user } = useAuth();
  const { businesses, transfers, initiateTransfer, processTransfer } = useData();
  const [showInitiateForm, setShowInitiateForm] = useState(false);
  const [formData, setFormData] = useState({
    fromBusinessId: '',
    toBusinessId: '',
    amount: '',
    mode: 'cash' as 'cash' | 'bank' | 'bajaj_finserv',
    description: '',
  });

  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    initiateTransfer({
      ...formData,
      amount: parseFloat(formData.amount),
      status: 'pending',
      initiatedBy: user?.id || '',
    });
    setFormData({
      fromBusinessId: '',
      toBusinessId: '',
      amount: '',
      mode: 'cash',
      description: '',
    });
    setShowInitiateForm(false);
  };

  const handleProcessTransfer = (transferId: string, action: 'accept' | 'reject') => {
    if (window.confirm(`Are you sure you want to ${action} this transfer?`)) {
      processTransfer(transferId, action, user?.id || '');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const canProcessTransfer = (transfer: Transfer) => {
    return user?.role === 'admin' || 
           (user?.assignedBusinesses.includes(transfer.toBusinessId) && 
            transfer.status === 'pending');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Money Transfers</h1>
          <p className="text-gray-600 mt-1">Transfer money between businesses with approval workflow</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'business_manager') && (
          <button
            onClick={() => setShowInitiateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Initiate Transfer</span>
          </button>
        )}
      </div>

      {/* Transfer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700 mt-2">
                {transfers.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Accepted</p>
              <p className="text-2xl font-bold text-green-700 mt-2">
                {transfers.filter(t => t.status === 'accepted').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700 mt-2">
                {transfers.filter(t => t.status === 'rejected').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">
                ₹{transfers.filter(t => t.status === 'accepted').reduce((sum, t) => sum + t.amount, 0).toLocaleString()}
              </p>
            </div>
            <ArrowRightLeft className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Initiate Transfer Form */}
      {showInitiateForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Initiate Money Transfer</h2>
            <button
              onClick={() => setShowInitiateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Business *</label>
              <select
                required
                value={formData.fromBusinessId}
                onChange={(e) => setFormData({ ...formData, fromBusinessId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select source business</option>
                {userBusinesses.map(business => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Business *</label>
              <select
                required
                value={formData.toBusinessId}
                onChange={(e) => setFormData({ ...formData, toBusinessId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select destination business</option>
                {businesses.filter(b => b.id !== formData.fromBusinessId).map(business => (
                  <option key={business.id} value={business.id}>{business.name}</option>
                ))}
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transfer Mode *</label>
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
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter transfer description or reason"
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowInitiateForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Send className="h-4 w-4" />
                <span>Initiate Transfer</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transfers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Transfer History</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No transfers yet</h3>
              <p className="text-gray-600">Initiate your first transfer to get started</p>
            </div>
          ) : (
            transfers.sort((a, b) => new Date(b.initiatedAt).getTime() - new Date(a.initiatedAt).getTime()).map((transfer) => (
              <div key={transfer.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ArrowRightLeft className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {businesses.find(b => b.id === transfer.fromBusinessId)?.name} → {businesses.find(b => b.id === transfer.toBusinessId)?.name}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                          {getStatusIcon(transfer.status)}
                          <span className="ml-1">{transfer.status}</span>
                        </span>
                      </div>
                      <p className="text-gray-600 mt-1">{transfer.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span>Amount: ₹{transfer.amount.toLocaleString()}</span>
                        <span>Mode: {transfer.mode}</span>
                        <span>Initiated: {new Date(transfer.initiatedAt).toLocaleDateString()}</span>
                        {transfer.processedAt && (
                          <span>Processed: {new Date(transfer.processedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {canProcessTransfer(transfer) && transfer.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleProcessTransfer(transfer.id, 'accept')}
                        className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleProcessTransfer(transfer.id, 'reject')}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}