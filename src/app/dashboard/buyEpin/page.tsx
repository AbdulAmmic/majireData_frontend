"use client";

import { API_BASE_URL } from "@/config";

import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, ArrowRight, Loader2, GraduationCap, Shield } from "lucide-react";
import MessageModal from "@/components/messageModal";

export default function BuyEpinPage() {
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

    const [exam, setExam] = useState("waec");
    const [quantity, setQuantity] = useState("1");
    const [pin, setPin] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        async function fetchPlans() {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch(`${API_BASE_URL}/api/services/plans?service=EPIN`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const body = await res.json();
                if (res.ok) {
                    setExams(body.data.map((item: any) => ({
                        id: item.id, // e.g., waec
                        name: item.name,
                        price: item.amount
                    })));
                }
            } catch (err) {
                console.error(err);
            }
        }
        fetchPlans();
    }, []);

    // Set default when loaded
    useEffect(() => {
        if (exams.length > 0 && !exams.find(e => e.id === exam)) {
            setExam(exams[0].id);
        }
    }, [exams, exam]);

    const getPrice = () => {
        const e = exams.find(x => x.id === exam);
        return e ? e.price : 0;
    };

    const getTotal = () => {
        return getPrice() * (parseInt(quantity) || 0);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        if (!pin) {
            showMessage("Validation Error", "Transaction PIN is required", "warning");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/services/education/epin`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    exam_type: exam,
                    quantity: parseInt(quantity),
                    transaction_pin: pin
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to generate PIN");
            }

            showMessage("Purchase Successful", `Success! PIN(s) generated. Reference: ${data.data.purchase_id}`, "success");
            setPin("");
        } catch (err: any) {
            showMessage("Purchase Failed", err.message, "error");
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
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Education PINs</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* FORM */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <GraduationCap className="w-6 h-6 text-green-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Buy Exam PIN</h2>
                            </div>

                            {message && (
                                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                                    <select
                                        value={exam}
                                        onChange={(e) => setExam(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        {exams.map(x => (
                                            <option key={x.id} value={x.id}>{x.name} (₦{x.price})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-gray-500">Unit Price</span>
                                        <span className="font-semibold">₦{getPrice()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Total</span>
                                        <span className="font-bold text-lg text-blue-600">₦{getTotal()}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            maxLength={4}
                                            value={pin}
                                            onChange={(e) => setPin(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none tracking-widest"
                                            placeholder="****"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Purchase PIN"}
                                    {!loading && <ArrowRight className="w-5 h-5" />}
                                </button>
                            </form>
                        </div>

                        {/* INFO */}
                        <div className="space-y-6">
                            <div className="bg-blue-600 rounded-2xl p-6 text-white">
                                <h3 className="text-lg font-bold mb-2">Instant Delivery</h3>
                                <p className="text-blue-100 text-sm">Your exam PIN will be generated instantly and displayed here. You can also find it in your transaction history.</p>
                            </div>

                            <div className="bg-white rounded-2xl border border-gray-200 p-6">
                                <h3 className="font-bold text-gray-900 mb-3">Recent PINs</h3>
                                <div className="text-center py-8 text-gray-400 text-sm">
                                    No recent purchases
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
