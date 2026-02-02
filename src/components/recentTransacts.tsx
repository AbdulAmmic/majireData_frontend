import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import { ChevronRight, Wallet, Plus, ArrowUp, ArrowDown, Phone, Wifi, Zap } from "lucide-react";

interface Transaction {
  id: string | number;
  title: string;
  amount: string;
  date: string;
  type: 'credit' | 'debit';
  category?: string;
}

interface RecentTransactionsProps {
  limit?: number;
  showViewAll?: boolean;
}

export default function RecentTransactions({
  limit,
  showViewAll = true
}: RecentTransactionsProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/wallet/transactions`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            const mapped = data.data.items.map((t: any) => ({
              id: t.id,
              title: t.narration || t.provider || "Transaction",
              amount: t.type === "CREDIT" ? `+₦${t.amount_naira}` : `-₦${t.amount_naira}`,
              date: new Date(t.created_at).toLocaleDateString(),
              type: t.type.toLowerCase(),
              category: t.provider === "DATASTATION" ? "Service" : "Wallet"
            }));
            setTransactions(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

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

  if (loading) {
    return (
      <div className="bg-white border border-gray-100/50 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl"></div>
          <div className="h-16 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

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

      {displayTransactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No transactions yet.
        </div>
      ) : (
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
                className={`text-sm font-semibold ${transaction.type === 'credit' ? 'text-green-600' : 'text-gray-900'
                  }`}
              >
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Total this month</span>
          <div className="flex items-center gap-4">
            {/* Note: Calculating real totals requires more data/logic not implemented here yet */}
            <span className="text-gray-900 font-bold">---</span>
          </div>
        </div>
      </div>
    </div>
  );
}