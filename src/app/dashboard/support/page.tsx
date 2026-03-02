"use client";

import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import { MessageCircle, Plus, ChevronRight, Clock, CheckCircle } from "lucide-react";
import MessageModal from "@/components/messageModal";

export default function SupportPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("support");
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);

    // New Ticket Form
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: "success" | "error" | "warning";
        isOpen: boolean;
    }>({ title: "", message: "", type: "success", isOpen: false });

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/support/complaints`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setComplaints(data.data.complaints);
            }
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/support/complaints`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ subject, message })
            });

            const data = await res.json();

            if (data.status === "success") {
                setModalConfig({
                    title: "Ticket Created",
                    message: "Your support ticket has been submitted successfully.",
                    type: "success",
                    isOpen: true
                });
                setShowNewTicket(false);
                setSubject("");
                setMessage("");
                fetchComplaints();
            } else {
                throw new Error(data.message || "Failed to create ticket");
            }
        } catch (error: any) {
            setModalConfig({
                title: "Error",
                message: error.message || "Failed to submit ticket",
                type: "error",
                isOpen: true
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "RESOLVED": return "bg-green-100 text-green-700";
            case "CLOSED": return "bg-gray-100 text-gray-700";
            default: return "bg-blue-100 text-blue-700";
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <MessageModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
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
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Support & Complaints</h1>
                            <p className="text-gray-500">Track and manage your support tickets</p>
                        </div>
                        <button
                            onClick={() => setShowNewTicket(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New Ticket
                        </button>
                    </div>

                    {showNewTicket && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-8 animate-in fade-in slide-in-from-top-4">
                            <h2 className="text-lg font-semibold mb-4">Create New Ticket</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="Briefly describe your issue"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea
                                        required
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                        placeholder="Provide detailed information about your issue..."
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewTicket(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? "Submitting..." : "Submit Ticket"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading tickets...</div>
                        ) : complaints.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No tickets found</h3>
                                <p className="text-gray-500">You haven't submitted any support tickets yet.</p>
                            </div>
                        ) : (
                            complaints.map((ticket) => (
                                <div key={ticket.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900">{ticket.subject}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.message}</p>
                                    </div>

                                    {ticket.admin_reply && (
                                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle className="w-4 h-4 text-blue-600" />
                                                <span className="font-semibold text-blue-900">Admin Response</span>
                                            </div>
                                            <p className="text-blue-800 whitespace-pre-wrap">{ticket.admin_reply}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
