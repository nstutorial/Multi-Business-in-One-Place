import { ArrowUpRight, ArrowDownLeft, Calendar, Tag } from 'lucide-react';
import { CashbookEntry } from '../../types';

interface RecentTransactionsProps {
  businessId: string;
  cashbookEntries: CashbookEntry[];
}

export function RecentTransactions({
  businessId,
  cashbookEntries,
}: RecentTransactionsProps) {
  const businessEntries = cashbookEntries
    .filter(entry => entry.businessId === businessId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <Calendar className="h-5 w-5 text-gray-400" />
      </div>

      <div className="space-y-4">
        {businessEntries.length === 0 ? (
          <div className="text-center py-8">
            <Tag className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No transactions yet</p>
          </div>
        ) : (
          businessEntries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  entry.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {entry.type === 'inflow' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownLeft className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{entry.description}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(entry.category)}`}>
                      {entry.category.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModeColor(entry.mode)}`}>
                      {entry.mode}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  entry.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {entry.type === 'inflow' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(entry.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}