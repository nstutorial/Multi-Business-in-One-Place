import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { DashboardStats } from './DashboardStats';
import { RecentTransactions } from './RecentTransactions';
import { Building2, Users, Plus, ShoppingCart, UserPlus, ArrowRightLeft } from 'lucide-react';

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export function Dashboard({ onTabChange }: DashboardProps) {
  const { user } = useAuth();
  const { businesses, cashbookEntries, customers, dueEntries, products } = useData();

  // Get user's assigned businesses
  const userBusinesses = user?.role === 'admin' 
    ? businesses 
    : businesses.filter(b => user?.assignedBusinesses.includes(b.id));

  const handleQuickAction = (action: string) => {
    if (onTabChange) {
      onTabChange(action);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {user?.name}! Here's your business overview.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-lg">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              {userBusinesses.length} Business{userBusinesses.length !== 1 ? 'es' : ''}
            </span>
          </div>
          <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
            <Users className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              {customers.length} Customers
            </span>
          </div>
        </div>
      </div>

      {userBusinesses.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No businesses assigned</h2>
          <p className="text-gray-600">
            Contact your administrator to get access to business data.
          </p>
        </div>
      ) : (
        userBusinesses.map((business) => (
          <div key={business.id} className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <h2 className="text-xl font-bold mb-2">{business.name}</h2>
              <p className="text-blue-100">{business.description}</p>
            </div>

            <DashboardStats
              businessId={business.id}
              cashbookEntries={cashbookEntries}
              customers={customers}
              dueEntries={dueEntries}
              products={products}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentTransactions
                businessId={business.id}
                cashbookEntries={cashbookEntries}
              />
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleQuickAction('cashbook')}
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors group"
                  >
                    <Plus className="h-6 w-6 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-blue-600 font-medium">Add Transaction</div>
                    <div className="text-sm text-blue-500 mt-1">Record cashbook entry</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('sales')}
                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors group"
                  >
                    <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-green-600 font-medium">New Sale</div>
                    <div className="text-sm text-green-500 mt-1">Create sale entry</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('customers')}
                    className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors group"
                  >
                    <UserPlus className="h-6 w-6 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-purple-600 font-medium">Add Customer</div>
                    <div className="text-sm text-purple-500 mt-1">Register new customer</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('transfers')}
                    className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors group"
                  >
                    <ArrowRightLeft className="h-6 w-6 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                    <div className="text-orange-600 font-medium">Transfer Money</div>
                    <div className="text-sm text-orange-500 mt-1">Between businesses</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}