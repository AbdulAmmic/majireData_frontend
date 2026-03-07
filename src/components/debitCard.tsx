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

    // 2. Fetch latest balance and profile from API
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        // Fetch Balance
        const balanceRes = await fetch(`${API_BASE_URL}/peyflex/wallet/balance/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        // Fetch Profile
        const profileRes = await fetch(`${API_BASE_URL}/peyflex/user/profile/`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setUser((prev: any) => ({
            ...prev,
            // Handle different possible Payflex response structures
            wallet_balance: balanceData.balance || balanceData.data?.balance || balanceData.balance_naira || (balanceData.data?.balance_kobo ? balanceData.data.balance_kobo / 100 : 0)
          }));
        }

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser((prev: any) => ({
            ...prev,
            ...(profileData.data || profileData), // merge profile data securely
            full_name: profileData.data?.full_name || profileData.full_name || prev?.full_name
          }));
        }
      } catch (err) {
        console.error("Failed to fetch robust user data from Payflex", err);
      }
    };

    fetchUserData();
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
    <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/25">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 opacity-90" />
          <span className="text-sm opacity-90">Available Balance</span>
        </div>
        <MoreVertical className="w-4 h-4 opacity-70" />
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">
            {formatCurrency(user.wallet_balance || 0)}
          </p>
          <p className="text-xs opacity-80 mt-1">{user.full_name}</p>
        </div>

        {user.virtual_account ? (
          <div className="flex items-center justify-between text-xs opacity-80">
            <div>
              <p>{user.virtual_account.bank_name}</p>
              <p className="font-mono text-base font-semibold mt-0.5">{user.virtual_account.account_number}</p>
              <p className="opacity-75">{user.virtual_account.account_name}</p>
            </div>
            <button
              onClick={() => copyToClipboard(user.virtual_account.account_number)}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-xs opacity-80">
            <p>No account details available.</p>
          </div>
        )}
      </div>
    </div>
  );
}