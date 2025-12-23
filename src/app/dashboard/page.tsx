"use client";
import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import WelcomeCard from "@/components/welcomeCard";
import BalanceCard from "@/components/debitCard";
import QuickActions from "@/components/quickActions";
// import RecentTrans
import ActivityChart from "@/components/activityChart";
import RecentTransactions from "@/components/recentTransacts";


export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");

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