"use client";

import { X, Wallet, User, MoreVertical } from "lucide-react";
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
  Settings 
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
    <aside
      className={`fixed inset-y-0 left-0 bg-white/95 backdrop-blur-lg w-72 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-all duration-300 ease-in-out z-30 lg:translate-x-0 lg:relative lg:bg-white/80 border-r border-gray-100/50`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-100/50">
          <button 
            onClick={() => handleNavigation("/dashboard")}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              Majire Sub
            </h1>
          </button>
          <button
            className="lg:hidden text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1">
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
                  handleNavigation("/transactions");
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
        <div className="p-4 border-t border-gray-100/50">
          <button 
            onClick={() => handleNavigation("/profile")}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors w-full text-left"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-400 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">Abdurrahman Mustapha</p>
              <p className="text-xs text-gray-500 truncate">Staff</p>
            </div>
            <MoreVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </button>
        </div>
      </div>
    </aside>
  );
}