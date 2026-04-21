import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/config";
import { Wallet, MoreVertical, Copy } from "lucide-react";

export default function BalanceCard() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // 1. Load initial state from local storage
    const storedUserStr = localStorage.getItem("user");
    let initialUser = null;
    if (storedUserStr) {
      initialUser = JSON.parse(storedUserStr);
      setUser(initialUser);
    }

    // 2. Fetch latest balance from API
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/wallet/me`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          // Update user object with new balance
          if (data.success) {
            setUser((prev: any) => ({
              ...prev,
              wallet_balance: data.data.balance_kobo / 100 // Convert kobo to naira if needed or store as is. Backend says / 100.
              // backend: "balance_kobo": balance, "balance_naira": ...
              // Let's use the one from response or stick to existing structure
            }));

            // Optionally update localStorage?
            // localStorage.setItem("user", JSON.stringify({...initialUser, wallet_balance: ...}));
          }
        }
      } catch (err) {
        console.error("Failed to fetch balance", err);
      }
    };

    fetchBalance();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount || 0);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Optional: Toast notification
  };

  if (!user) return <div className="animate-pulse bg-gray-200 h-48 rounded-2xl"></div>;

  return (
    <div className="premium-gradient text-white rounded-[2.5rem] p-5 shadow-xl shadow-blue-500/20 transition-transform duration-300 hover:scale-[1.02]">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest opacity-80">Available Funds</span>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-xl transition-colors">
          <MoreVertical className="w-4 h-4 opacity-70" />
        </button>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-3xl font-black tracking-tight mb-1">
            {formatCurrency(user.wallet_balance || 0)}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 ml-0.5">{user.full_name}</p>
        </div>

        {user.virtual_account ? (
          <div className="bg-white/10 border border-white/10 p-3.5 rounded-[1.75rem] backdrop-blur-sm relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1">{user.virtual_account.bank_name}</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-bold tracking-wider">{user.virtual_account.account_number}</p>
                <button
                  onClick={() => copyToClipboard(user.virtual_account.account_number)}
                  className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-all active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] font-medium opacity-50 mt-1 truncate">{user.virtual_account.account_name}</p>
            </div>
          </div>
        ) : (
          <div className="text-xs opacity-60 italic py-2">
            <p>No investment details available.</p>
          </div>
        )}
      </div>
    </div>
  );
}