"use client";

import { API_BASE_URL } from "@/config";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import {
  ChevronRight,
  Loader2,
  Wallet,
  CreditCard,
  Building,
  ArrowRight,
  Copy,
  CheckCircle,
  RefreshCw
} from "lucide-react";

type PaymentMethodKey = "transfer" | "card";

export default function FundWalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("wallet");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("transfer");
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [walletData, setWalletData] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/wallet/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setWalletData(data.data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch wallet info", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const generateAccount = async () => {
    setProcessing(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/wallet/dedicated-account/gafia`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to generate account");
      }

      alert("Virtual account generated successfully!");
      fetchWalletData(); // Refresh to show the new account

    } catch (err: any) {
      setError(err.message || "Error generating account");
    } finally {
      setProcessing(false);
    }
  };

  const initPaystack = async () => {
    if (!amount || Number(amount) < 100) {
      alert("Minimum amount is ₦100");
      return;
    }

    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/wallet/fund/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ amount_naira: Number(amount) })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Payment init failed");

      const authUrl = data.data.paystack_response.data.authorization_url;
      if (authUrl) {
        window.location.href = authUrl;
      } else {
        alert("Payment URL invalid");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  const formatNaira = (amt: number) => `₦${amt.toLocaleString("en-NG")}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col lg:pl-64">
        <Header setSidebarOpen={setSidebarOpen} />

        <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 font-medium">Fund Wallet</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Fund Wallet</h1>
            <p className="text-gray-600">Top up your balance instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Balance Card */}
            <div className="md:col-span-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white text-center sm:text-left sm:flex sm:items-center sm:justify-between shadow-lg">
              <div>
                <p className="text-blue-100 text-sm mb-1">Current Balance</p>
                <div className="text-3xl font-bold">
                  {loading ? "..." : formatNaira(walletData?.balance_naira || 0)}
                </div>
              </div>
              <button
                onClick={fetchWalletData}
                className="mt-4 sm:mt-0 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                title="Refresh Balance"
              >
                <RefreshCw className={`h-5 w-5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Methods Tabs */}
            <div className="md:col-span-3 flex gap-4 border-b border-gray-200 pb-1">
              <button
                onClick={() => setPaymentMethod("transfer")}
                className={`pb-3 px-4 font-medium transition-colors border-b-2 ${paymentMethod === "transfer"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Bank Transfer (Automated)
              </button>
              <button
                onClick={() => setPaymentMethod("card")}
                className={`pb-3 px-4 font-medium transition-colors border-b-2 ${paymentMethod === "card"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
              >
                Pay with Card
              </button>
            </div>

            {/* Main Action Area */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm min-h-[300px]">

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {paymentMethod === "transfer" && (
                    <div className="max-w-xl mx-auto text-center space-y-6">
                      <div className="bg-blue-50 p-4 rounded-full inline-block">
                        <Building className="h-8 w-8 text-blue-600" />
                      </div>

                      {walletData?.virtual_account ? (
                        <>
                          <h2 className="text-xl font-semibold text-gray-900">Your Dedicated Account</h2>
                          <p className="text-gray-600">Transfer to this account number to fund your wallet instantly.</p>

                          <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-left space-y-4">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-sm">Bank Name</span>
                              <span className="font-bold text-gray-900">{walletData.virtual_account.bank_name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-sm">Account Number</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xl font-bold text-blue-600">
                                  {walletData.virtual_account.account_number}
                                </span>
                                <button onClick={() => copyToClipboard(walletData.virtual_account.account_number)}>
                                  <Copy className="h-4 w-4 text-gray-400 hover:text-blue-600" />
                                </button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-gray-500 text-sm">Account Name</span>
                              <span className="font-semibold text-gray-900">{walletData.virtual_account.account_name}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 justify-center text-green-600 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            <span>Account Active & Ready</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <h2 className="text-xl font-semibold text-gray-900">Get Your Personal Account</h2>
                          <p className="text-gray-600">
                            You don't have a dedicated account yet. Generate one instantly to start funding via bank transfer.
                          </p>

                          {error && <p className="text-red-500 bg-red-50 p-3 rounded-lg text-sm">{error}</p>}

                          <button
                            onClick={generateAccount}
                            disabled={processing}
                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto"
                          >
                            {processing ? (
                              <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate Account Number"
                            )}
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {paymentMethod === "card" && (
                    <div className="max-w-md mx-auto space-y-6">
                      <div className="text-center">
                        <h2 className="text-lg font-semibold mb-2">Fund with Card</h2>
                        <p className="text-sm text-gray-500">Secure payment via Paystack</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="e.g. 5000"
                          className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>

                      <button
                        onClick={initPaystack}
                        disabled={processing || !amount}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"
                      >
                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                        Proceed to Payment
                      </button>

                      <p className="text-xs text-center text-gray-400">
                        Secured by Paystack. Minimal transaction fee may apply.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}