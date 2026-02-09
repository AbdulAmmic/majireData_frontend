"use client";

import { API_BASE_URL } from "@/config";
import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, Search, Filter, Download, ExternalLink, RefreshCcw, Loader2 } from "lucide-react";
import ReceiptModal from "@/components/ReceiptModal";

export default function TransactionsPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("transactions");

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [selectedTx, setSelectedTx] = useState(null);
    const [receiptOpen, setReceiptOpen] = useState(false);

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const res = await fetch(`${API_BASE_URL}/api/services/history?page=${page}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();

            if (res.ok) {
                setTransactions(data.data.items);
                setTotalPages(data.data.pages);
            } else {
                setError(data.message || "Failed to load transactions");
            }
        } catch (err) {
            setError("Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [page]);

    const handleViewReceipt = (tx: any) => {
        setSelectedTx(tx);
        setReceiptOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

            <ReceiptModal
                isOpen={receiptOpen}
                onClose={() => setReceiptOpen(false)}
                transaction={selectedTx}
            />

            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <div className="flex-1 flex flex-col lg:pl-72 transition-all duration-300">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Transactions</span>
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                            <p className="text-gray-600">View and manage all your service purchases</p>
                        </div>
                        <button
                            onClick={fetchTransactions}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                            title="Refresh"
                        >
                            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

                        {/* Table Header - Hidden on mobile, shown on desktop */}
                        <div className="hidden md:grid grid-cols-6 gap-4 p-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="col-span-2">Service</div>
                            <div>Amount</div>
                            <div>Status</div>
                            <div>Date</div>
                            <div className="text-right">Action</div>
                        </div>

                        {loading && transactions.length === 0 ? (
                            <div className="p-12 flex justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center text-red-500">
                                {error}
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                No transactions found.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {transactions.map((tx: any) => (
                                    <div key={tx.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 hover:bg-gray-50/50 transition-colors items-center">

                                        {/* Mobile: Header for Service */}
                                        <div className="md:col-span-2 flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.service === "DATA" ? "bg-purple-100 text-purple-600" :
                                                    tx.service === "AIRTIME" ? "bg-yellow-100 text-yellow-600" :
                                                        "bg-blue-100 text-blue-600"
                                                }`}>
                                                {tx.service[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900">{tx.service}</div>
                                                <div className="text-xs text-gray-500 md:hidden">{new Date(tx.date).toLocaleString()}</div>
                                                <div className="text-xs text-gray-500 font-mono">{tx.id.substring(0, 12)}...</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between md:block">
                                            <span className="md:hidden text-sm text-gray-500">Amount:</span>
                                            <div className="font-semibold text-gray-900">{tx.amount}</div>
                                        </div>

                                        <div className="flex justify-between md:block">
                                            <span className="md:hidden text-sm text-gray-500">Status:</span>
                                            <div>
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.status === "SUCCESS" ? "bg-green-100 text-green-800" :
                                                        tx.status === "FAILED" ? "bg-red-100 text-red-800" :
                                                            "bg-yellow-100 text-yellow-800"
                                                    }`}>
                                                    {tx.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="hidden md:block text-sm text-gray-500">
                                            {new Date(tx.date).toLocaleDateString()}
                                            <div className="text-xs">{new Date(tx.date).toLocaleTimeString()}</div>
                                        </div>

                                        <div className="flex justify-end mt-2 md:mt-0">
                                            <button
                                                onClick={() => handleViewReceipt(tx)}
                                                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Receipt
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Prev
                                </button>
                                <span className="px-3 py-1 text-gray-600">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
