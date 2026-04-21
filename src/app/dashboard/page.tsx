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
        <main className="flex-1 p-5 md:p-8 space-y-8 max-w-[1400px] mx-auto w-full overflow-x-hidden">
          {/* WELCOME AND BALANCE SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <WelcomeCard />
            <BalanceCard />
          </div>

          {/* QUICK ACTIONS */}
          <QuickActions />

          {/* USSD BALANCE CHECKS */}
          <div className="glass-card rounded-[2.5rem] soft-shadow p-6 transition-all duration-300 hover:shadow-md">
            <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 flex items-center gap-3 ml-1">
              <span className="w-1.5 h-4 premium-gradient rounded-full"></span>
              Balance Verification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-5 bg-amber-50/50 rounded-[1.75rem] border border-amber-100/50 group hover:bg-amber-50 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1.5">MTN SME Balance</p>
                  <p className="text-3xl font-black text-amber-900 font-mono tracking-tighter">*461*4#</p>
                </div>
                <div className="w-14 h-14 bg-amber-400 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-amber-200 transition-transform group-hover:scale-110">MTN</div>
              </div>
              <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-[1.75rem] border border-blue-100/50 group hover:bg-blue-50 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1.5">Gifting/CG Balance</p>
                  <p className="text-3xl font-black text-blue-900 font-mono tracking-tighter">*323*4#</p>
                </div>
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-200 transition-transform group-hover:scale-110">C/G</div>
              </div>
            </div>
          </div>

          {/* RECENT TRANSACTIONS & ACTIVITY */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-10">
            <div className="glass-card rounded-[2.5rem] p-6 soft-shadow">
               <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 ml-1">Recent Activity</h3>
               <RecentTransactions />
            </div>
            <div className="glass-card rounded-[2.5rem] p-6 soft-shadow">
               <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-6 ml-1">Volume Analytics</h3>
               <ActivityChart />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}