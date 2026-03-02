"use client";

import { API_BASE_URL } from "@/config";

import { useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, ArrowRight, Loader2, Phone, AlertCircle } from "lucide-react";
import MessageModal from "@/components/messageModal";

export default function AirtimeToCashPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("service");

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

    const [formData, setFormData] = useState({
        network: "",
        amount: "",
        phone_from: "",
        share_pin: "",
        transaction_pin: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const networks = [
        { id: "MTN", name: "MTN", color: "bg-yellow-400" },
        { id: "AIRTEL", name: "Airtel", color: "bg-red-500" },
        { id: "GLO", name: "Glo", color: "bg-green-500" },
        { id: "9MOBILE", name: "9Mobile", color: "bg-green-700" }
    ];

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!formData.transaction_pin) {
            showMessage("Validation Error", "Transaction PIN is required", "warning");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/services/airtime/cash`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to submit request");
            }

            const message = data.message || "Request submitted successfully! Cheetahpay will verify and credit your wallet.";

            // If Cheetahpay returned a specific instruction (e.g. number to transfer to), show it
            const displayMessage = data.cheetahpay_response?.message || message;

            showMessage("Request Submitted", displayMessage, "success");

            setFormData({
                network: "",
                amount: "",
                phone_from: "",
                share_pin: "",
                transaction_pin: ""
            });

        } catch (err: any) {
            showMessage("Request Failed", err.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <MessageModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col lg:pl-64">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Airtime to Cash</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* INSTRUCTIONS */}
                        <div className="bg-blue-600 rounded-2xl p-8 text-white h-fit">
                            <h2 className="text-2xl font-bold mb-4">How it works</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">1</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Select Network</h3>
                                        <p className="text-blue-100 text-sm mt-1">Choose the network you want to transfer airtime from.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">2</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Transfer Airtime</h3>
                                        <p className="text-blue-100 text-sm mt-1">Transfer the amount to our dedicated numbers below.</p>
                                        <div className="mt-3 bg-white/10 rounded-xl p-4 text-sm font-mono space-y-2">
                                            <div className="flex justify-between"><span>MTN</span> <span>0803 456 7890</span></div>
                                            <div className="flex justify-between"><span>Airtel</span> <span>0802 345 6789</span></div>
                                            <div className="flex justify-between"><span>Glo</span> <span>0805 234 5678</span></div>
                                            <div className="flex justify-between"><span>9Mobile</span> <span>0809 123 4567</span></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold flex-shrink-0">3</div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Submit Request</h3>
                                        <p className="text-blue-100 text-sm mt-1">Fill the form with details of the transfer. We will verify and credit your wallet.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Submit Request</h2>

                            {message && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-start gap-3">
                                    <div className="mt-1"><AlertCircle className="w-5 h-5" /></div>
                                    <p>{message}</p>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                                    <select
                                        name="network"
                                        value={formData.network}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        required
                                    >
                                        <option value="">Select Network</option>
                                        {networks.map(n => (
                                            <option key={n.id} value={n.id}>{n.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount Sent (₦)</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="1000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Sent From</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            name="phone_from"
                                            value={formData.phone_from}
                                            onChange={handleInputChange}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="08012345678"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Share PIN (Optional)</label>
                                    <input
                                        type="text"
                                        name="share_pin"
                                        value={formData.share_pin}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="If you used Share & Sell"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                                    <input
                                        type="password"
                                        name="transaction_pin"
                                        maxLength={4}
                                        value={formData.transaction_pin}
                                        onChange={handleInputChange}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none tracking-widest"
                                        placeholder="****"
                                        required
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
                                        {!loading && <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
