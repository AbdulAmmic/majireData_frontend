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
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Live Feed</p>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-bold text-slate-600">Updated recently</p>
          </div>
        </div>
        {showViewAll && (
          <button className="flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-wider bg-blue-50/50 px-3 py-2 rounded-xl hover:bg-blue-100 transition-all group">
            View All
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        )}
      </div>

      {displayTransactions.length === 0 ? (
        <div className="text-center py-10 text-slate-400 font-medium text-xs">
          No records found
        </div>
      ) : (
        <div className="space-y-4">
          {displayTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-3.5 rounded-[1.25rem] hover:bg-slate-50/50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#f1f5f9]"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${getTransactionColor(transaction.type, transaction.category)} shadow-sm`}>
                  {getTransactionIcon(transaction.type, transaction.category)}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-slate-900 tracking-tight leading-none mb-1.5">{transaction.title}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{transaction.date}</p>
                </div>
              </div>
              <p
                className={`text-[13px] font-black tracking-tight ${transaction.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                  }`}
              >
                {transaction.amount}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      <div className="mt-8 pt-5 border-t border-[#f1f5f9]">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-slate-400">
          <span>Monthly Volume</span>
          <span className="text-slate-900">₦---</span>
        </div>
      </div>
    </div>
  );
}