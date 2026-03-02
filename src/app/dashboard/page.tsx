"use client";
import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import WelcomeCard from "@/components/welcomeCard";
import BalanceCard from "@/components/debitCard";
import QuickActions from "@/components/quickActions";
// import RecentTrans
import ActivityChart from "@/components/activityChart";
import RecentTransactions from "@/components/recentTransacts";
import PinSetupModal from "@/components/pinSetupModal";


export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [showPinModal, setShowPinModal] = useState(false);

  useEffect(() => {
    // Check if user has PIN
    const checkPin = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch(`${API_BASE_URL}/api/wallet/me`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data.has_pin === false) {
            setShowPinModal(true);
          }
        }
      } catch (err) {
        console.error("Failed to check PIN status", err);
      }
    };

    checkPin();
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50/50">
      {/* SIDEBAR */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {showPinModal && (
        <PinSetupModal onSuccess={() => setShowPinModal(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* CONTENT */}
        <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
          {/* WELCOME AND BALANCE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <WelcomeCard />
            <BalanceCard />
          </div>

          {/* QUICK ACTIONS */}
          <QuickActions />

          {/* USSD BALANCE CHECKS */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              Check Balance USSD Codes
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <div>
                  <p className="text-xs font-bold text-yellow-800 uppercase tracking-wider">MTN SME Balance</p>
                  <p className="text-2xl font-black text-yellow-900 font-mono">*461*4#</p>
                </div>
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold">MTN</div>
              </div>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Gifting/Corporate Balance</p>
                  <p className="text-2xl font-black text-blue-900 font-mono">*323*4#</p>
                </div>
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">C/G</div>
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS & ACTIVITY */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />
            <ActivityChart />
          </section>
        </main>
      </div>
    </div>
  );
}