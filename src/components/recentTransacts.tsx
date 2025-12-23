import { ChevronRight, Wallet, Plus, ArrowUp, ArrowDown } from "lucide-react";

interface Transaction {
  id: number;
  title: string;
  amount: string;
  date: string;
  type: 'credit' | 'debit';
  category?: string;
}

const transactions: Transaction[] = [
  { 
    id: 1, 
    title: "Airtime Purchase", 
    amount: "-₦500", 
    date: "Oct 21, 2025", 
    type: "debit",
    category: "Airtime"
  },
  { 
    id: 2, 
    title: "Wallet Funding", 
    amount: "+₦5,000", 
    date: "Oct 20, 2025", 
    type: "credit",
    category: "Funding"
  },
  { 
    id: 3, 
    title: "Data Purchase", 
    amount: "-₦1,200", 
    date: "Oct 18, 2025", 
    type: "debit",
    category: "Data"
  },
  { 
    id: 4, 
    title: "Referral Bonus", 
    amount: "+₦500", 
    date: "Oct 15, 2025", 
    type: "credit",
    category: "Bonus"
  },
  { 
    id: 5, 
    title: "Electricity Bill", 
    amount: "-₦3,500", 
    date: "Oct 14, 2025", 
    type: "debit",
    category: "Utilities"
  },
];

interface RecentTransactionsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function RecentTransactions({ 
  limit, 
  showViewAll = true 
}: RecentTransactionsProps) {
  const displayTransactions = limit ? transactions.slice(0, limit) : transactions;

  const getTransactionIcon = (type: 'credit' | 'debit', category?: string) => {
    if (type === 'credit') {
      return <ArrowDown className="w-3 h-3" />;
    }
    
    // Different icons for different debit categories
    switch (category) {
      case 'Airtime':
        return <Phone className="w-3 h-3" />;
      case 'Data':
        return <Wifi className="w-3 h-3" />;
      case 'Utilities':
        return <Zap className="w-3 h-3" />;
      default:
        return <Wallet className="w-3 h-3" />;
    }
  };

  const getTransactionColor = (type: 'credit' | 'debit', category?: string) => {
    if (type === 'credit') {
      return 'bg-green-100 text-green-600';
    }
    
    // Different colors for different debit categories
    switch (category) {
      case 'Airtime':
        return 'bg-blue-100 text-blue-600';
      case 'Data':
        return 'bg-purple-100 text-purple-600';
      case 'Utilities':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-red-100 text-red-600';
    }
  };

  return (
    <div className="bg-white border border-gray-100/50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <p className="text-sm text-gray-500 mt-1">Your latest activities</p>
        </div>
        {showViewAll && (
          <button className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors group">
            View All
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50/50 transition-all duration-200 group cursor-pointer border border-transparent hover:border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type, transaction.category)}`}>
                {getTransactionIcon(transaction.type, transaction.category)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{transaction.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500">{transaction.date}</p>
                  {transaction.category && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{transaction.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <p
              className={`text-sm font-semibold ${
                transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
              }`}
            >
              {transaction.amount}
            </p>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total this month</span>
          <div className="flex items-center gap-4">
            <span className="text-green-600 font-semibold">+₦5,500</span>
            <span className="text-red-600 font-semibold">-₦5,200</span>
            <span className="text-gray-900 font-bold">₦300</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Add missing icons
function Phone({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function Wifi({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
    </svg>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}