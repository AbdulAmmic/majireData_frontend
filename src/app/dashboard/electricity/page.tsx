"use client";

import { API_BASE_URL } from "@/config";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, Zap, Loader2, Search, CreditCard, Shield } from "lucide-react";

import MessageModal from "@/components/messageModal";

export default function ElectricityPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("service");

    // Custom Modal State
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

    // Form State
    const [discos, setDiscos] = useState<any[]>([]);
    const [selectedDisco, setSelectedDisco] = useState("");
    const [meterNumber, setMeterNumber] = useState("");
    const [meterType, setMeterType] = useState("prepaid");
    const [amount, setAmount] = useState("");
    const [pin, setPin] = useState("");

    // Validation State
    const [validating, setValidating] = useState(false);
    const [verifiedName, setVerifiedName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        async function fetchDiscos() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;
                const res = await fetch(`${API_BASE_URL}/peyflex/electricity/plans/?identifier=electricity`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const body = await res.json();
                if (res.ok) {
                    const plans = Array.isArray(body) ? body : (body.plans || body.data || []);
                    setDiscos(plans);
                    if (plans.length > 0) setSelectedDisco(plans[0].id || plans[0].plan_code || plans[0].name);
                }
            } catch (e) {
                console.error(e);
            }
        }
        fetchDiscos();
    }, []);

    const validateMeter = async () => {
        if (!meterNumber || !selectedDisco) return;
        setValidating(true);
        setError("");
        setVerifiedName("");

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/peyflex/electricity/verify/?identifier=electricity&meter=${meterNumber}&plan=${selectedDisco}&type=${meterType}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                // Adjust based on actual provider response structure
                // Assuming provider_response contains name or valid status
                // If it's pure DataStation response, it might be data.provider_response.name
                setVerifiedName(data.data.provider_response?.name || "Verified Customer");
            } else {
                setError(data.message || "Could not validate meter");
            }
        } catch (e) {
            setError("Validation error");
        } finally {
            setValidating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        setMessage("");

        if (!pin) {
            setError("Transaction PIN is required");
            setSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const userPhone = JSON.parse(localStorage.getItem("user") || "{}").phone || "08000000000";

            const res = await fetch(`${API_BASE_URL}/peyflex/electricity/subscribe/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    identifier: "electricity",
                    plan: selectedDisco,
                    meter: meterNumber,
                    type: meterType,
                    amount: amount,
                    phone: userPhone,
                    transaction_pin: pin
                })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Payment failed");

            setMessage(`Payment Successful! Token: ${data.data.provider_response?.token || "Sent via SMS"}`);
            setPin("");
            setAmount("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />
            {sidebarOpen && <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col lg:pl-64">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/dashboard" className="hover:text-amber-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Electricity</span>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <Zap className="w-6 h-6 text-yellow-600" />
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">Electricity Bill Payment</h1>
                        </div>

                        {message && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-xl">{message}</div>}
                        {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
                            {/* DISCO */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Distribution Company</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                                    value={selectedDisco}
                                    onChange={(e) => setSelectedDisco(e.target.value)}
                                >
                                    {discos.map(d => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* METER TYPE */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meter Type</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="mtype" value="prepaid" checked={meterType === "prepaid"} onChange={() => setMeterType("prepaid")} className="text-yellow-600 focus:ring-yellow-500" />
                                        <span>Prepaid</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="mtype" value="postpaid" checked={meterType === "postpaid"} onChange={() => setMeterType("postpaid")} className="text-yellow-600 focus:ring-yellow-500" />
                                        <span>Postpaid</span>
                                    </label>
                                </div>
                            </div>

                            {/* METER NUMBER */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meter Number</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={meterNumber}
                                        onChange={(e) => setMeterNumber(e.target.value)}
                                        placeholder="Enter meter number"
                                        className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={validateMeter}
                                        disabled={validating || !meterNumber}
                                        className="px-4 bg-yellow-100 text-yellow-700 rounded-xl font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
                                    >
                                        {validating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify"}
                                    </button>
                                </div>
                                {verifiedName && <p className="mt-2 text-sm text-green-600 font-medium">✓ {verifiedName}</p>}
                            </div>

                            {/* AMOUNT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₦)</label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    min="100"
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            {/* PIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction PIN</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="password"
                                        value={pin}
                                        onChange={(e) => setPin(e.target.value)}
                                        maxLength={4}
                                        placeholder="****"
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 tracking-widest"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting || !verifiedName}
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/20 transition-all disabled:opacity-50 disabled:shadow-none"
                            >
                                {submitting ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : "Pay Bill"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
