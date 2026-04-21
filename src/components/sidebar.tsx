"use client";

import { X, Wallet, User, MoreVertical, LogOut } from "lucide-react";
import SidebarItem from "./sidebarItem";
import {
  Home,
  Wifi,
  Phone,
  Tv,
  Calculator,
  DollarSign,
  Clock,
  BarChart2,
  Settings,
  Zap,
  GraduationCap,
  Banknote,
  MessageCircle
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  activeView,
  setActiveView
}: SidebarProps) {
  // Function to handle navigation
  const handleNavigation = (path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  return (
    <>
      {/* Sidebar fixed for both mobile and desktop */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-[#f1f5f9] z-50 transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0 w-64 shadow-xl shadow-slate-200/50" : "-translate-x-full lg:translate-x-0 lg:w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* ... branding etc ... */}
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-5 border-b border-gray-100/50">
              <button
                onClick={() => handleNavigation("/dashboard")}
                className="flex items-center gap-3 hover:opacity-90 transition-opacity"
              >
                <div className="w-9 h-9 rounded-2xl flex items-center justify-center overflow-hidden bg-white shadow-sm ring-1 ring-black/5">
                  <img src="/logo.png" alt="Majire" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">
                  Majire
                </h1>
              </button>
              <button
                className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors p-2"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
              <div className="space-y-1">
                <SidebarItem
                  icon={<Home className="w-4 h-4" />}
                  label="Dashboard"
                  active={activeView === "dashboard"}
                  onClick={() => {
                    setActiveView("dashboard");
                    handleNavigation("/dashboard");
                  }}
                />
                <SidebarItem
                  icon={<Wifi className="w-4 h-4" />}
                  label="Buy Data"
                  active={activeView === "data"}
                  onClick={() => {
                    setActiveView("data");
                    handleNavigation("/dashboard/buyData");
                  }}
                />
                <SidebarItem
                  icon={<Phone className="w-4 h-4" />}
                  label="Buy Airtime"
                  active={activeView === "airtime"}
                  onClick={() => {
                    setActiveView("airtime");
                    handleNavigation("/dashboard/buyAirtime");
                  }}
                />
                <SidebarItem
                  icon={<Tv className="w-4 h-4" />}
                  label="Cable Sub"
                  active={activeView === "cable"}
                  onClick={() => {
                    setActiveView("cable");
                    handleNavigation("/dashboard/cableSub");
                  }}
                />
                <SidebarItem
                  icon={<Zap className="w-4 h-4" />}
                  label="Electricity"
                  active={activeView === "electricity"}
                  onClick={() => {
                    setActiveView("electricity");
                    handleNavigation("/dashboard/electricity");
                  }}
                />
                <SidebarItem
                  icon={<GraduationCap className="w-4 h-4" />}
                  label="Education"
                  active={activeView === "education"}
                  onClick={() => {
                    setActiveView("education");
                    handleNavigation("/dashboard/buyEpin");
                  }}
                />
                <SidebarItem
                  icon={<Banknote className="w-4 h-4" />}
                  label="Airtime 2 Cash"
                  active={activeView === "airtime-cash"}
                  onClick={() => {
                    setActiveView("airtime-cash");
                    handleNavigation("/dashboard/airtime-cash");
                  }}
                />
                <SidebarItem
                  icon={<Wallet className="w-4 h-4" />}
                  label="Fund Wallet"
                  active={activeView === "fund"}
                  onClick={() => {
                    setActiveView("fund");
                    handleNavigation("/dashboard/fundWallet");
                  }}
                />
              </div>

              <div className="pt-6">
                <p className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3 tracking-wider">
                  Help & Support
                </p>
                <div className="space-y-1">
                  <SidebarItem
                    icon={<MessageCircle className="w-4 h-4" />}
                    label="Support"
                    active={activeView === "support"}
                    onClick={() => {
                      setActiveView("support");
                      handleNavigation("/dashboard/support");
                    }}
                  />
                </div>
              </div>

              <div className="pt-6">
                <p className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3 tracking-wider">
                  Tools
                </p>
                <div className="space-y-1">
                  <SidebarItem
                    icon={<Calculator className="w-4 h-4" />}
                    label="Calculator"
                    active={activeView === "calculator"}
                    onClick={() => {
                      setActiveView("calculator");
                      handleNavigation("/calculator");
                    }}
                  />
                  <SidebarItem
                    icon={<DollarSign className="w-4 h-4" />}
                    label="Pricing"
                    active={activeView === "pricing"}
                    onClick={() => {
                      setActiveView("pricing");
                      handleNavigation("/pricing");
                    }}
                  />
                </div>
              </div>

              <div className="pt-6">
                <p className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3 tracking-wider">
                  Management
                </p>
                <div className="space-y-1">
                  <SidebarItem
                    icon={<Clock className="w-4 h-4" />}
                    label="Transactions"
                    active={activeView === "transactions"}
                    onClick={() => {
                      setActiveView("transactions");
                      handleNavigation("/dashboard/transactions");
                    }}
                  />
                  <SidebarItem
                    icon={<BarChart2 className="w-4 h-4" />}
                    label="Analytics"
                    active={activeView === "analytics"}
                    onClick={() => {
                      setActiveView("analytics");
                      handleNavigation("/analytics");
                    }}
                  />
                  <SidebarItem
                    icon={<Settings className="w-4 h-4" />}
                    label="Settings"
                    active={activeView === "settings"}
                    onClick={() => {
                      setActiveView("settings");
                      handleNavigation("/settings");
                    }}
                  />
                </div>
              </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-gray-100/50 space-y-2 bg-slate-50/30">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm w-full text-left">
                <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-slate-200">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate tracking-tight">Profile</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">Account Manager</p>
                </div>
              </div>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to log out?")) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }
                }}
                className="flex items-center gap-3 p-3 text-red-500 hover:bg-rose-50 hover:text-rose-600 rounded-2xl transition-all w-full text-left font-bold text-xs uppercase tracking-widest"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Spacer for desktop to prevent content overlap */}
      <div className="hidden lg:block lg:w-64 flex-shrink-0" />
    </>
  );
}