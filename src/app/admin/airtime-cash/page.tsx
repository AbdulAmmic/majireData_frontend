"use client";

import { API_BASE_URL } from "@/config";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Clock, Loader2, Save, RefreshCw } from "lucide-react";

type NetworkSetting = {
    network: string;
    switched_on: boolean;
    enabled: boolean;
    collection_phone: string | null;
    rate_percent: number;
    min: number;
    max: number;
    updated_by: string | null;
};

type A2CRequest = {
    id: string;
    user_name: string;
    user_email: string;
    network: string;
    phone_from: string;
    collection_phone: string | null;
    amount_naira: number;
    rate_percent: number;
    payout_naira: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    admin_note: string | null;
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

export default function AdminAirtimeCashPage() {
    const [mode, setMode] = useState<"manual" | "auto">("manual");
    const [autoAvailable, setAutoAvailable] = useState(false);
    const [nets, setNets] = useState<NetworkSetting[]>([]);
    const [saving, setSaving] = useState(false);
    const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);

    const [status, setStatus] = useState("PENDING");
    const [requests, setRequests] = useState<A2CRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [received, setReceived] = useState<Record<string, string>>({});

    const loadSettings = useCallback(async () => {
        const r = await api("airtime-cash/settings");
        if (r.ok) { setMode(r.data.mode); setAutoAvailable(r.data.auto_available); setNets(r.data.networks); }
    }, []);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        const r = await api(`airtime-cash?per_page=50${status ? `&status=${status}` : ""}`);
        if (r.ok) setRequests(r.data.requests || []);
        setLoading(false);
    }, [status]);

    useEffect(() => { loadSettings(); }, [loadSettings]);
    useEffect(() => { loadRequests(); }, [loadRequests]);

    const edit = (network: string, patch: Partial<NetworkSetting>) =>
        setNets((ns) => ns.map((n) => (n.network === network ? { ...n, ...patch } : n)));

    const save = async () => {
        setSaving(true);
        setNotice(null);
        const r = await api("airtime-cash/settings", "PUT", {
            mode,
            networks: nets.map((n) => ({
                network: n.network, enabled: n.switched_on, collection_phone: n.collection_phone || "",
                rate_percent: n.rate_percent, min_naira: n.min, max_naira: n.max,
            })),
        });
        setSaving(false);
        setNotice({ ok: r.ok, text: r.ok ? "Settings saved. Customers see them straight away." : r.message });
        if (r.ok) { setNets(r.data.networks); setMode(r.data.mode); }
    };

    const act = async (req: A2CRequest, action: "approve" | "reject") => {
        let body: Record<string, unknown> = {};
        if (action === "approve") {
            const got = received[req.id];
            if (got) body.received_naira = Number(got);
            const amount = got ? Number(got) : req.amount_naira;
            const pay = Math.floor(amount * req.rate_percent) / 100;
            if (!confirm(`Confirm ${naira(amount)} ${req.network} airtime was received from ${req.phone_from}?\n\n${naira(pay)} will be added to ${req.user_email}'s wallet.`)) return;
        } else {
            const note = prompt("Reason for rejecting (the customer sees this):", "Airtime not received");
            if (note === null) return;
            body = { note };
        }
        setBusy(req.id);
        const r = await api(`airtime-cash/${req.id}/${action}`, "POST", body);
        setBusy(null);
        if (!r.ok) alert(r.message);
        loadRequests();
    };

    const input = "w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none";

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Airtime to Cash</h1>

            {/* SETTINGS */}
            <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                        <p className="text-sm text-gray-500">Where customers send airtime, and what % of it they receive.</p>
                    </div>
                    <div className="flex rounded-lg border border-gray-200 overflow-hidden text-sm">
                        <button onClick={() => setMode("manual")} className={`px-4 py-2 ${mode === "manual" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}>Manual (admin confirms)</button>
                        <button onClick={() => autoAvailable && setMode("auto")} disabled={!autoAvailable}
                            title={autoAvailable ? "" : "Needs AIRTIMETOCASH_TOKEN on the server"}
                            className={`px-4 py-2 ${mode === "auto" ? "bg-blue-600 text-white" : "bg-white text-gray-700"} disabled:opacity-50`}>Automatic provider</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-gray-500 border-b">
                                <th className="py-2 pr-3">Network</th>
                                <th className="py-2 pr-3">On</th>
                                <th className="py-2 pr-3">Collection number</th>
                                <th className="py-2 pr-3">Rate %</th>
                                <th className="py-2 pr-3">Min ₦</th>
                                <th className="py-2 pr-3">Max ₦</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nets.map((n) => (
                                <tr key={n.network} className="border-b last:border-0">
                                    <td className="py-3 pr-3 font-medium text-gray-900">{n.network}</td>
                                    <td className="py-3 pr-3">
                                        <input type="checkbox" checked={n.switched_on} onChange={(e) => edit(n.network, { switched_on: e.target.checked })} className="w-4 h-4" />
                                    </td>
                                    <td className="py-3 pr-3 min-w-[160px]">
                                        <input value={n.collection_phone || ""} onChange={(e) => edit(n.network, { collection_phone: e.target.value })} className={input} placeholder="0803..." />
                                    </td>
                                    <td className="py-3 pr-3 w-24">
                                        <input type="number" min={1} max={100} step="0.5" value={n.rate_percent} onChange={(e) => edit(n.network, { rate_percent: Number(e.target.value) })} className={input} />
                                    </td>
                                    <td className="py-3 pr-3 w-28">
                                        <input type="number" value={n.min} onChange={(e) => edit(n.network, { min: Number(e.target.value) })} className={input} />
                                    </td>
                                    <td className="py-3 pr-3 w-32">
                                        <input type="number" value={n.max} onChange={(e) => edit(n.network, { max: Number(e.target.value) })} className={input} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center gap-4">
                    <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save settings
                    </button>
                    {notice && <p className={`text-sm ${notice.ok ? "text-green-700" : "text-red-600"}`}>{notice.text}</p>}
                </div>
                <p className="text-xs text-gray-500">A rate change only affects new requests. Each request keeps the rate the customer was shown.</p>
            </section>

            {/* REQUESTS */}
            <section className="bg-white rounded-xl border border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Requests</h2>
                    <div className="flex items-center gap-2">
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="PENDING">Waiting for confirmation</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="">All</option>
                        </select>
                        <button onClick={loadRequests} className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50" title="Refresh"><RefreshCw className="w-4 h-4" /></button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : requests.length === 0 ? (
                    <p className="text-center text-gray-500 py-12 text-sm">No requests here.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="p-4">Customer</th>
                                    <th className="p-4">Airtime</th>
                                    <th className="p-4">From → To</th>
                                    <th className="p-4">Pays</th>
                                    <th className="p-4">When</th>
                                    <th className="p-4">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map((r) => (
                                    <tr key={r.id} className="border-b last:border-0 align-top">
                                        <td className="p-4"><p className="font-medium text-gray-900">{r.user_name}</p><p className="text-xs text-gray-500">{r.user_email}</p></td>
                                        <td className="p-4"><p className="font-medium">{naira(r.amount_naira)}</p><p className="text-xs text-gray-500">{r.network} · {r.rate_percent}%</p></td>
                                        <td className="p-4 text-xs text-gray-700">{r.phone_from}<br />→ {r.collection_phone || "—"}</td>
                                        <td className="p-4 font-semibold text-green-700">{naira(r.payout_naira)}</td>
                                        <td className="p-4 text-xs text-gray-500">{r.created_at ? new Date(r.created_at + "Z").toLocaleString() : ""}</td>
                                        <td className="p-4">
                                            {r.status === "PENDING" ? (
                                                <div className="space-y-2 min-w-[180px]">
                                                    <input type="number" placeholder={`Received (default ${r.amount_naira})`} value={received[r.id] || ""}
                                                        onChange={(e) => setReceived({ ...received, [r.id]: e.target.value })} className={input} />
                                                    <div className="flex gap-2">
                                                        <button onClick={() => act(r, "approve")} disabled={busy === r.id}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                            <Check className="w-3.5 h-3.5" /> Confirm
                                                        </button>
                                                        <button onClick={() => act(r, "reject")} disabled={busy === r.id}
                                                            className="flex-1 inline-flex items-center justify-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-60">
                                                            <X className="w-3.5 h-3.5" /> Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${r.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                        {r.status === "APPROVED" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {r.status === "APPROVED" ? "Approved" : "Rejected"}
                                                    </span>
                                                    {r.admin_note && <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{r.admin_note}</p>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
            <p className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> Only confirm after the airtime shows on the collection line.</p>
        </div>
    );
}
