"use client";

import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import {
    User,
    Lock,
    Key,
    ShieldCheck,
    ChevronRight,
    Loader2,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import MessageModal from "@/components/messageModal";

export default function SettingsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("settings");
    const [loading, setLoading] = useState(false);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: "success" | "error" | "warning";
    }>({ title: "", message: "", type: "success" });

    const showMessage = (title: string, message: string, type: "success" | "error" | "warning" = "success") => {
        setModalConfig({ title, message, type });
        setModalOpen(true);
    };

    const [user, setUser] = useState<any>(null);

    // PIN Reset State
    const [pinStep, setPinStep] = useState<"request" | "confirm">("request");
    const [pinToken, setPinToken] = useState("");
    const [newPin, setNewPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    const handlePinResetRequest = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/auth/pin/reset-request`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setPinStep("confirm");
                showMessage("Code Sent", "A reset code has been sent to your email.", "success");
            } else {
                throw new Error(data.message || "Failed to request PIN reset");
            }
        } catch (err: any) {
            showMessage("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handlePinResetConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPin !== confirmPin) {
            showMessage("Validation Error", "PINs do not match", "warning");
            return;
        }
        if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
            showMessage("Validation Error", "PIN must be 4 digits", "warning");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/auth/pin/reset-confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ token: pinToken, new_pin: newPin })
            });
            const data = await res.json();
            if (res.ok) {
                showMessage("Success", "Transaction PIN reset successfully!", "success");
                setPinStep("request");
                setPinToken("");
                setNewPin("");
                setConfirmPin("");
            } else {
                throw new Error(data.message || "Failed to reset PIN");
            }
        } catch (err: any) {
            showMessage("Error", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <MessageModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activeView={activeView}
                setActiveView={setActiveView}
            />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <span>Dashboard</span>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Settings</span>
                    </div>

                    <div className="space-y-6">
                        {/* PROFILE SECTION */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Profile Information
                                </h2>
                            </div>
                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                                    <p className="text-gray-900 font-medium">{user?.full_name || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                                    <p className="text-gray-900 font-medium">{user?.email || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                                    <p className="text-gray-900 font-medium">{user?.phone || "N/A"}</p>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Status</label>
                                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Active
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* SECURITY SECTION */}
                        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-gray-50">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-blue-600" />
                                    Account Security
                                </h2>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Transaction PIN Reset */}
                                <div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                                <Key className="w-4 h-4 text-orange-500" />
                                                Transaction PIN
                                            </h3>
                                            <p className="text-sm text-gray-500">Reset your 4-digit transaction selection PIN.</p>
                                        </div>

                                        {pinStep === "request" && (
                                            <button
                                                onClick={handlePinResetRequest}
                                                disabled={loading}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-medium transition-all disabled:opacity-70 flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Reset Code"}
                                            </button>
                                        )}
                                    </div>

                                    {pinStep === "confirm" && (
                                        <form onSubmit={handlePinResetConfirm} className="bg-gray-50 rounded-2xl p-6 space-y-4 border border-gray-100 max-w-md">
                                            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl flex items-start gap-3 text-sm mb-4">
                                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                                <p>Check your email for the 6-digit reset code.</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Reset Code</label>
                                                <input
                                                    type="text"
                                                    value={pinToken}
                                                    onChange={(e) => setPinToken(e.target.value)}
                                                    placeholder="123456"
                                                    className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    required
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">New PIN</label>
                                                    <input
                                                        type="password"
                                                        maxLength={4}
                                                        value={newPin}
                                                        onChange={(e) => setNewPin(e.target.value)}
                                                        placeholder="****"
                                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none tracking-widest text-center font-bold"
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm PIN</label>
                                                    <input
                                                        type="password"
                                                        maxLength={4}
                                                        value={confirmPin}
                                                        onChange={(e) => setConfirmPin(e.target.value)}
                                                        placeholder="****"
                                                        className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none tracking-widest text-center font-bold"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    type="submit"
                                                    disabled={loading}
                                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                                >
                                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                    Reset PIN
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setPinStep("request")}
                                                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}
