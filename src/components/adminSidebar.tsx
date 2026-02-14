"use client";

import { X, Wallet, User, LogOut, Users, FileText, DollarSign, BarChart2, Shield, MessageSquare } from "lucide-react";
import SidebarItem from "./sidebarItem";

interface SidebarProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    activeView: string;
    setActiveView: (view: string) => void;
}

export default function AdminSidebar({
    sidebarOpen,
    setSidebarOpen,
    activeView,
    setActiveView
}: SidebarProps) {
    const handleNavigation = (path: string) => {
        if (typeof window !== 'undefined') {
            window.location.href = path;
        }
    };

    return (
        <aside
            className={`fixed inset-y-0 left-0 bg-slate-900 text-white w-72 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                } transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:relative lg:bg-slate-900 border-r border-slate-800`}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <h1 className="text-xl font-bold text-white">
                            Admin Portal
                        </h1>
                    </div>
                    <button
                        className="lg:hidden text-gray-400 hover:text-white transition-colors"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-6 space-y-1">
                    <SidebarItem
                        icon={<BarChart2 className="w-4 h-4" />}
                        label="Overview"
                        active={activeView === "dashboard"}
                        onClick={() => {
                            setActiveView("dashboard");
                            handleNavigation("/admin/dashboard");
                        }}
                    />
                    <SidebarItem
                        icon={<Users className="w-4 h-4" />}
                        label="Users"
                        active={activeView === "users"}
                        onClick={() => {
                            setActiveView("users");
                            handleNavigation("/admin/users");
                        }}
                    />
                    <SidebarItem
                        icon={<MessageSquare className="w-4 h-4" />}
                        label="Complaints"
                        active={activeView === "complaints"}
                        onClick={() => {
                            setActiveView("complaints");
                            handleNavigation("/admin/complaints");
                        }}
                    />
                    <SidebarItem
                        icon={<FileText className="w-4 h-4" />}
                        label="Transactions"
                        active={activeView === "transactions"}
                        onClick={() => {
                            setActiveView("transactions");
                            handleNavigation("/admin/transactions");
                        }}
                    />
                    <SidebarItem
                        icon={<DollarSign className="w-4 h-4" />}
                        label="Pricing & Plans"
                        active={activeView === "pricing"}
                        onClick={() => {
                            setActiveView("pricing");
                            handleNavigation("/admin/pricing");
                        }}
                    />

                    <div className="pt-6 mt-6 border-t border-slate-800">
                        <p className="text-xs uppercase text-slate-500 font-semibold mb-3 px-3 tracking-wider">
                            Quick Links
                        </p>
                        <SidebarItem
                            icon={<Wallet className="w-4 h-4" />}
                            label="Buy Data (Self)"
                            active={false}
                            onClick={() => {
                                handleNavigation("/dashboard/buyData");
                            }}
                        />
                    </div>
                </nav>

                <div className="p-4 border-t border-slate-800 space-y-2">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 w-full text-left">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">Administrator</p>
                            <p className="text-xs text-slate-400 truncate">Super Admin</p>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (confirm("Logout of Admin Portal?")) {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.href = "/";
                            }
                        }}
                        className="flex items-center gap-3 p-3 rounded-xl text-red-400 hover:bg-red-900/20 transition-colors w-full text-left font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
