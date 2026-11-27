"use client";

import { API_BASE_URL } from "@/config";
import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw, Check, X } from "lucide-react";

type Deposit = {
    order_no: string;
    amount_naira: number;
    payer_name: string | null;
    payer_bank: string | null;
    payer_account: string | null;
    reason: string | null;
    status: "OPEN" | "CREDITED" | "DISMISSED";
    credited_to: string | null;
    handled_by: string | null;
    note: string | null;
    created_at: string;
};

const naira = (n: number) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

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

export default function AdminDepositsPage() {
    const [status, setStatus] = useState("OPEN");
    const [items, setItems] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [emails, setEmails] = useState<Record<string, string>>({});
    const [busy, setBusy] = useState<string | null>(null);
    const [msg, setMsg] = useState<Record<string, { ok: boolean; text: string }>>({});

    const load = useCallback(async () => {
        setLoading(true);
        const r = await api(`deposits/unmatched?status=${status}`);
        if (r.ok) setItems(r.data.items || []);
        setLoading(false);
    }, [status]);

    useEffect(() => { load(); }, [load]);

    const credit = async (d: Deposit) => {
        const email = (emails[d.order_no] || "").trim().toLowerCase();
        if (!email) { setMsg((m) => ({ ...m, [d.order_no]: { ok: false, text: "Enter the customer's email" } })); return; }
        if (!confirm(`Credit this ${naira(d.amount_naira)} deposit from ${d.payer_name || "unknown payer"} to ${email}?\n\nThe normal deposit fee applies.`)) return;
        setBusy(d.order_no);
        const r = await api(`deposits/unmatched/${encodeURIComponent(d.order_no)}/credit`, "POST", { email });
        setBusy(null);
        setMsg((m) => ({ ...m, [d.order_no]: { ok: r.ok, text: r.message } }));
        if (r.ok) load();
    };

    const dismiss = async (d: Deposit) => {
        const note = prompt("Why isn't this a customer deposit?", "Not a customer deposit");
        if (note === null) return;
        setBusy(d.order_no);
        const r = await api(`deposits/unmatched/${encodeURIComponent(d.order_no)}/dismiss`, "POST", { note });
        setBusy(null);
        if (!r.ok) setMsg((m) => ({ ...m, [d.order_no]: { ok: false, text: r.message } }));
        else load();
    };

    const input = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Unmatched deposits</h1>
                    <p className="text-sm text-gray-500 max-w-2xl">
                        PalmPay payments that didn&apos;t come with a customer&apos;s account number, usually because they were sent to your
                        merchant balance. Find the customer by the payer&apos;s name, then credit them.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                        <option value="OPEN">Waiting</option>
                        <option value="CREDITED">Credited</option>
                        <option value="DISMISSED">Not a customer</option>
                        <option value="ALL">All</option>
                    </select>
                    <button onClick={load} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : items.length === 0 ? (
                    <p className="text-center text-gray-500 py-12 text-sm">Nothing here.</p>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="p-4">Received</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Payer</th>
                                <th className="p-4">PalmPay order</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((d) => (
                                <tr key={d.order_no} className="border-b last:border-0 align-top">
                                    <td className="p-4 text-xs text-gray-500">{new Date(d.created_at + "Z").toLocaleString()}</td>
                                    <td className="p-4 font-semibold">{naira(d.amount_naira)}</td>
                                    <td className="p-4"><p className="font-medium text-gray-900">{d.payer_name || "—"}</p><p className="text-xs text-gray-500">{[d.payer_bank, d.payer_account].filter(Boolean).join(" · ")}</p></td>
                                    <td className="p-4 text-xs font-mono text-gray-500">{d.order_no}</td>
                                    <td className="p-4 min-w-[260px]">
                                        {d.status === "OPEN" ? (
                                            <div className="space-y-2">
                                                <input type="email" placeholder="customer@gmail.com" value={emails[d.order_no] || ""}
                                                    onChange={(e) => setEmails({ ...emails, [d.order_no]: e.target.value })} className={input} />
                                                <div className="flex gap-2">
                                                    <button onClick={() => credit(d)} disabled={busy === d.order_no}
                                                        className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                        {busy === d.order_no ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Credit customer
                                                    </button>
                                                    <button onClick={() => dismiss(d)} disabled={busy === d.order_no}
                                                        className="inline-flex items-center justify-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                        <X className="w-3.5 h-3.5" /> Not a customer
                                                    </button>
                                                </div>
                                                {msg[d.order_no] && <p className={`text-xs ${msg[d.order_no].ok ? "text-green-700" : "text-red-600"}`}>{msg[d.order_no].text}</p>}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-600">
                                                {d.status === "CREDITED" ? `Credited to ${d.credited_to}` : d.note || "Not a customer deposit"}
                                                {d.handled_by && <span className="block text-gray-400">by {d.handled_by}</span>}
                                            </p>
                                        )}
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
