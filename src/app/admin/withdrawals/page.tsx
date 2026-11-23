"use client";

import { API_BASE_URL } from "@/config";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Loader2, RefreshCw, Send } from "lucide-react";

type Withdrawal = {
    id: string;
    user_name: string;
    user_email: string;
    amount_naira: number;
    fee_naira: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: "PENDING_APPROVAL" | "PROCESSING" | "SUCCESS" | "FAILED" | "REJECTED";
    refunded: boolean;
    order_id: string;
    provider_order_no: string | null;
    admin_note: string | null;
    last_error: string | null;
    created_at: string;
};

const naira = (n: number) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const BADGE: Record<Withdrawal["status"], [string, string]> = {
    PENDING_APPROVAL: ["Needs approval", "bg-orange-100 text-orange-700"],
    PROCESSING: ["Processing", "bg-blue-100 text-blue-700"],
    SUCCESS: ["Sent", "bg-green-100 text-green-700"],
    FAILED: ["Failed · refunded", "bg-red-100 text-red-700"],
    REJECTED: ["Rejected · refunded", "bg-red-100 text-red-700"],
};

async function api(path: string, method = "GET", body?: unknown) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}/api/admin/${path}`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok && json.success !== false, message: json.message || "Something went wrong", data: json.data || {} };
}

export default function AdminWithdrawalsPage() {
    const [status, setStatus] = useState("PENDING_APPROVAL");
    const [items, setItems] = useState<Withdrawal[]>([]);
    const [counts, setCounts] = useState({ pending_approval: 0, processing: 0, approval_above_naira: 0 });
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        const r = await api(`withdrawals${status ? `?status=${status}` : ""}`);
        if (r.ok) { setItems(r.data.items || []); setCounts(r.data); }
        setLoading(false);
    }, [status]);

    useEffect(() => { load(); }, [load]);

    const act = async (w: Withdrawal, action: "approve" | "reject" | "requery") => {
        let body: Record<string, unknown> = {};
        if (action === "approve" && !confirm(`Send ${naira(w.amount_naira)} to ${w.account_name} (${w.bank_name} ${w.account_number})?`)) return;
        if (action === "reject") {
            const note = prompt("Reason for rejecting (the money goes back to the customer's wallet):", "");
            if (note === null) return;
            body = { note };
        }
        setBusy(w.id);
        const r = await api(`withdrawals/${w.id}/${action}`, "POST", body);
        setBusy(null);
        alert(r.message);
        load();
    };

    const requeryAll = async () => {
        setBusy("all");
        const r = await api("withdrawals/requery-stale", "POST", {});
        setBusy(null);
        alert(r.message);
        load();
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Withdrawals</h1>
                    <p className="text-sm text-gray-500">
                        {counts.pending_approval} waiting for approval · {counts.processing} processing ·
                        withdrawals above {naira(counts.approval_above_naira)} need approval
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option value="PENDING_APPROVAL">Needs approval</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="SUCCESS">Sent</option>
                        <option value="FAILED">Failed</option>
                        <option value="REJECTED">Rejected</option>
                        <option value="">All</option>
                    </select>
                    <button onClick={requeryAll} disabled={busy === "all"} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 text-sm" title="Ask PalmPay about withdrawals stuck in processing">
                        {busy === "all" ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Check stuck
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : items.length === 0 ? (
                    <p className="text-center text-gray-500 py-12 text-sm">No withdrawals here.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="p-4">Customer</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">To account</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">When</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((w) => (
                                <tr key={w.id} className="border-b last:border-0 align-top">
                                    <td className="p-4"><p className="font-medium text-gray-900">{w.user_name}</p><p className="text-xs text-gray-500">{w.user_email}</p></td>
                                    <td className="p-4"><p className="font-semibold">{naira(w.amount_naira)}</p><p className="text-xs text-gray-500">fee {naira(w.fee_naira)}</p></td>
                                    <td className="p-4"><p className="font-medium">{w.account_name}</p><p className="text-xs text-gray-500">{w.bank_name} · {w.account_number}</p></td>
                                    <td className="p-4">
                                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${BADGE[w.status][1]}`}>{BADGE[w.status][0]}</span>
                                        {w.last_error && <p className="text-xs text-red-600 mt-1 max-w-[200px]">{w.last_error}</p>}
                                        {w.admin_note && <p className="text-xs text-gray-500 mt-1 max-w-[200px]">{w.admin_note}</p>}
                                        <p className="text-[11px] text-gray-400 mt-1 font-mono">{w.order_id}</p>
                                    </td>
                                    <td className="p-4 text-xs text-gray-500">{new Date(w.created_at + "Z").toLocaleString()}</td>
                                    <td className="p-4">
                                        {w.status === "PENDING_APPROVAL" && (
                                            <div className="flex gap-2">
                                                <button onClick={() => act(w, "approve")} disabled={busy === w.id}
                                                    className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                    <Send className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button onClick={() => act(w, "reject")} disabled={busy === w.id}
                                                    className="inline-flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                    <X className="w-3.5 h-3.5" /> Reject
                                                </button>
                                            </div>
                                        )}
                                        {w.status === "PROCESSING" && (
                                            <button onClick={() => act(w, "requery")} disabled={busy === w.id}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold">
                                                {busy === w.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} Check status
                                            </button>
                                        )}
                                        {w.status === "SUCCESS" && <Check className="w-4 h-4 text-green-600" />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
