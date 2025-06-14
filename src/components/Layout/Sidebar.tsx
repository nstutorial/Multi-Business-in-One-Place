import { 
  LayoutDashboard, 
  Building2, 
  DollarSign, 
  ArrowRightLeft, 
  Users, 
  Receipt, 
  Package, 
  BarChart3,
  Settings,
  LogOut,
  ShoppingBag,
  Warehouse
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'businesses', label: 'Businesses', icon: Building2, roles: ['admin'] },
    { id: 'cashbook', label: 'Cashbook', icon: DollarSign, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'transfers', label: 'Transfers', icon: ArrowRightLeft, roles: ['admin', 'business_manager'] },
    { id: 'customers', label: 'Customers', icon: Users, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'dues', label: 'Due Register', icon: Receipt, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'products', label: 'Products', icon: Package, roles: ['admin', 'business_manager'] },
    { id: 'purchases', label: 'Purchases', icon: ShoppingBag, roles: ['admin', 'business_manager'] },
    { id: 'stock', label: 'Stock', icon: Warehouse, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'sales', label: 'Sales', icon: BarChart3, roles: ['admin', 'business_manager', 'staff'] },
    { id: 'reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'business_manager'] },
    { id: 'admin', label: 'Admin Panel', icon: Settings, roles: ['admin'] },
  ];

  const availableMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">CashBook Pro</h1>
            <p className="text-sm text-gray-500">Multi-Business</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {availableMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500">{user?.email}</p>
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${
            user?.role === 'admin' 
              ? 'bg-purple-100 text-purple-800'
              : user?.role === 'business_manager'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {user?.role?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}