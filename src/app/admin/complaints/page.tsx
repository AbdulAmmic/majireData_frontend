"use client";

import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, CheckCircle, Clock, XCircle, ChevronRight, ChevronLeft } from "lucide-react";
import MessageModal from "@/components/messageModal";

export default function AdminComplaintsPage() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [statusFilter, setStatusFilter] = useState("");

    // Reply Modal
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyMessage, setReplyMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Toast
    const [modalConfig, setModalConfig] = useState<{
        title: string;
        message: string;
        type: "success" | "error" | "warning";
        isOpen: boolean;
    }>({ title: "", message: "", type: "success", isOpen: false });

    useEffect(() => {
        fetchComplaints();
    }, [page, statusFilter]);

    const fetchComplaints = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const url = new URL(`${API_BASE_URL}/api/admin/complaints`);
            url.searchParams.append("page", page.toString());
            if (statusFilter) url.searchParams.append("status", statusFilter);

            const res = await fetch(url.toString(), {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.status === "success") {
                setComplaints(data.data.complaints);
                setTotalPages(data.data.pages);
            }
        } catch (error) {
            console.error("Failed to fetch complaints", error);
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (newStatus: string) => {
        if (!selectedTicket) return;
        setSubmitting(true);

        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/admin/complaints/${selectedTicket.id}/resolve`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    reply: replyMessage,
                    status: newStatus
                })
            });

            const data = await res.json();

            if (data.status === "success") {
                setModalConfig({
                    title: "Updated",
                    message: "Complaint updated successfully",
                    type: "success",
                    isOpen: true
                });
                setSelectedTicket(null);
                setReplyMessage("");
                fetchComplaints();
            } else {
                throw new Error(data.message || "Update failed");
            }
        } catch (error: any) {
            setModalConfig({
                title: "Error",
                message: error.message || "Failed to update ticket",
                type: "error",
                isOpen: true
            });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "RESOLVED":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-green-100 text-green-700 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Resolved</span>;
            case "CLOSED":
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium"><XCircle className="w-3 h-3" /> Closed</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-medium"><Clock className="w-3 h-3" /> Open</span>;
        }
    };

    return (
        <div className="space-y-6">
            <MessageModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                title={modalConfig.title}
                message={modalConfig.message}
                type={modalConfig.type}
            />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                    <p className="text-gray-500">Manage user support tickets</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setPage(1);
                            }}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-900 font-medium">
                            <tr>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Subject</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        Loading complaints...
                                    </td>
                                </tr>
                            ) : complaints.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                        No complaints found
                                    </td>
                                </tr>
                            ) : (
                                complaints.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4">
                                            {getStatusBadge(ticket.status)}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {ticket.user_email}
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-xs" title={ticket.message}>
                                            <div className="font-medium text-gray-900">{ticket.subject}</div>
                                            <div className="text-xs text-gray-500 truncate">{ticket.message}</div>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {new Date(ticket.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedTicket(ticket);
                                                    setReplyMessage(ticket.admin_reply || "");
                                                }}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                                            >
                                                View & Reply
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        Page {page} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl animate-in zoom-in-95">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Ticket Details</h2>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-semibold text-gray-900">{selectedTicket.subject}</span>
                                    <span className="text-sm text-gray-500">{selectedTicket.user_email}</span>
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.message}</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Reply</label>
                                <textarea
                                    rows={4}
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                                    placeholder="Type your response here..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => handleResolve("CLOSED")}
                                disabled={submitting}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                            >
                                Close Ticket
                            </button>
                            <button
                                onClick={() => handleResolve("RESOLVED")}
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                                {submitting ? "Saving..." : "Send Reply & Resolve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
