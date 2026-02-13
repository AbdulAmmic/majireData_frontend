"use client";

import { API_BASE_URL } from "@/config";
import { useEffect, useState } from "react";
import { Users, CreditCard, Wallet, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_users: 0,
        total_user_balance: 0,
        pending_transactions: 0,
        total_sales: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === "success") {
                setStats(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, color }: any) => (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : value}
                </h3>
            </div>
            <div className={`p-4 rounded-xl ${color} bg-opacity-10`}>
                {icon}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.total_users}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    color="bg-blue-600"
                />
                <StatCard
                    title="User Wallet Balances"
                    value={`₦${stats.total_user_balance.toLocaleString()}`}
                    icon={<Wallet className="w-6 h-6 text-green-600" />}
                    color="bg-green-600"
                />
                <StatCard
                    title="Pending Transactions"
                    value={stats.pending_transactions}
                    icon={<CreditCard className="w-6 h-6 text-orange-600" />}
                    color="bg-orange-600"
                />
                <StatCard
                    title="Total Sales"
                    value={`₦${stats.total_sales.toLocaleString()}`}
                    icon={<TrendingUp className="w-6 h-6 text-purple-600" />}
                    color="bg-purple-600"
                />
            </div>

            {/* Quick Actions or Recent Activity could go here */}
        </div>
    );
}
