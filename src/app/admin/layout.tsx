"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/adminSidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const [activeView, setActiveView] = useState("dashboard");

    const router = useRouter();

    useEffect(() => {
        if (pathname.includes("/users")) setActiveView("users");
        else if (pathname.includes("/transactions")) setActiveView("transactions");
        else if (pathname.includes("/pricing")) setActiveView("pricing");
        else setActiveView("dashboard");
    }, [pathname]);

    useEffect(() => {
        if (pathname !== "/admin/login") {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/admin/login");
            }
        }
    }, [pathname]);

    // Don't show layout on login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <AdminSidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            <main className="flex-1 flex flex-col min-w-0 overflow-hidden h-screen">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                    <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
