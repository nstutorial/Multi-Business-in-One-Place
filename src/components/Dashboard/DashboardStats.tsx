import { TrendingUp, TrendingDown, DollarSign, Users, Receipt, Package } from 'lucide-react';
import { CashbookEntry, Customer, DueEntry, Product } from '../../types';

interface DashboardStatsProps {
  businessId: string;
  cashbookEntries: CashbookEntry[];
  customers: Customer[];
  dueEntries: DueEntry[];
  products: Product[];
}

export function DashboardStats({
  businessId,
  cashbookEntries,
  customers,
  dueEntries,
  products,
}: DashboardStatsProps) {
  const businessEntries = cashbookEntries.filter(entry => entry.businessId === businessId);
  const businessCustomers = customers.filter(customer => customer.businessId === businessId);
  const businessDues = dueEntries.filter(due => due.businessId === businessId);
  const businessProducts = products.filter(product => product.businessId === businessId);

  const totalInflow = businessEntries
    .filter(entry => entry.type === 'inflow')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const totalOutflow = businessEntries
    .filter(entry => entry.type === 'outflow')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const netBalance = totalInflow - totalOutflow;

  const totalDue = businessDues.reduce((sum, due) => sum + due.dueAmount, 0);

  // Today's data
  const today = new Date().toISOString().split('T')[0];
  const todayEntries = businessEntries.filter(entry => entry.date.startsWith(today));
  const todayInflow = todayEntries
    .filter(entry => entry.type === 'inflow')
    .reduce((sum, entry) => sum + entry.amount, 0);

  const stats = [
    {
      title: 'Net Balance',
      value: `₹${netBalance.toLocaleString()}`,
      change: netBalance >= 0 ? '+' : '',
      changeType: netBalance >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: netBalance >= 0 ? 'text-green-600' : 'text-red-600',
      bgColor: netBalance >= 0 ? 'bg-green-50' : 'bg-red-50',
    },
    {
      title: "Today's Earnings",
      value: `₹${todayInflow.toLocaleString()}`,
      change: '+',
      changeType: 'positive',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total Outstanding',
      value: `₹${totalDue.toLocaleString()}`,
      change: '',
      changeType: 'neutral',
      icon: Receipt,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Total Customers',
      value: businessCustomers.length.toString(),
      change: '',
      changeType: 'neutral',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className={`text-2xl font-bold mt-2 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}