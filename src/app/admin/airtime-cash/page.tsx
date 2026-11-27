"use client";

import { API_BASE_URL } from "@/config";
import { useCallback, useEffect, useState } from "react";
import { Check, X, Loader2, Save, RefreshCw, Phone, ArrowRight, Settings2, Inbox, Zap, UserCheck } from "lucide-react";

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

type Msg = { ok: boolean; text: string };

// Same rules as the server (utils/airtimetocash.normalize_phone): 0803..., 803..., +234803..., +2340803...
const normalizePhone = (raw: string): string | null => {
    let d = (raw || "").replace(/\D/g, "");
    if (d.startsWith("2340") && d.length === 14) d = d.slice(3);
    else if (d.startsWith("234") && d.length === 13) d = "0" + d.slice(3);
    else if (d.length === 10 && "789".includes(d[0])) d = "0" + d;
    return /^0[789][01]\d{8}$/.test(d) ? d : null;
};

const naira = (n: number) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

type FieldErrors = Partial<Record<"phone" | "rate" | "min" | "max", string>>;

// No upper limit on min/max: how much airtime to accept is the admin's call.
function fieldProblems(n: NetworkSetting): FieldErrors {
    const e: FieldErrors = {};
    if (n.collection_phone && !normalizePhone(n.collection_phone)) e.phone = "Not a valid Nigerian number. Example: 08031234567";
    if (!(n.rate_percent >= 1 && n.rate_percent <= 100)) e.rate = "1 to 100";
    if (!Number.isInteger(n.min) || n.min < 50) e.min = "At least ₦50";
    if (!Number.isInteger(n.max) || n.max < 50) e.max = "At least ₦50";
    else if (Number.isInteger(n.min) && n.max < n.min) e.max = "Must not be below the minimum";
    return e;
}

const NAMES: Record<string, string> = { MTN: "MTN", AIRTEL: "Airtel", GLO: "Glo", "9MOBILE": "9mobile" };
const COLORS: Record<string, string> = { MTN: "bg-yellow-400 text-yellow-950", AIRTEL: "bg-red-500 text-white", GLO: "bg-green-600 text-white", "9MOBILE": "bg-emerald-900 text-white" };

async function api(path: string, method = "GET", body?: unknown) {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_BASE_URL}/api/admin/${path}`, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: body ? JSON.stringify(body) : undefined,
        });
        const json = await res.json().catch(() => ({}));
        return { ok: res.ok && json.success !== false, message: json.message || "Something went wrong", data: json.data || {} };
    } catch {
        return { ok: false, message: "Network problem. Check your connection and try again.", data: {} as any };
    }
}

const inputBase = "w-full px-3 py-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none";

function NetworkBadge({ network }: { network: string }) {
    return (
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${COLORS[network] || "bg-gray-200"}`}>
            {(NAMES[network] || network).slice(0, 3).toUpperCase()}
        </span>
    );
}

export default function AdminAirtimeCashPage() {
    const [tab, setTab] = useState<"requests" | "setup">("requests");
    const [mode, setMode] = useState<"manual" | "auto">("manual");
    const [autoAvailable, setAutoAvailable] = useState(false);
    const [nets, setNets] = useState<NetworkSetting[]>([]);
    const [saved, setSaved] = useState<Record<string, NetworkSetting>>({});
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const [savingNet, setSavingNet] = useState<string | null>(null);
    const [cardMsg, setCardMsg] = useState<Record<string, Msg>>({});
    const [modeMsg, setModeMsg] = useState<Msg | null>(null);
    const [modeSaving, setModeSaving] = useState(false);

    const [status, setStatus] = useState("PENDING");
    const [requests, setRequests] = useState<A2CRequest[]>([]);
    const [pendingCount, setPendingCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState<string | null>(null);
    const [received, setReceived] = useState<Record<string, string>>({});
    const [reqMsg, setReqMsg] = useState<Record<string, Msg>>({});

    const applySettings = (data: any) => {
        setMode(data.mode);
        setNets(data.networks);
        setSaved(Object.fromEntries(data.networks.map((n: NetworkSetting) => [n.network, n])));
    };

    const loadSettings = useCallback(async () => {
        const r = await api("airtime-cash/settings");
        if (r.ok) {
            setAutoAvailable(r.data.auto_available);
            applySettings(r.data);
            // Nothing set up yet: open the setup tab first.
            if (!r.data.networks.some((n: NetworkSetting) => n.enabled)) setTab("setup");
        }
        setSettingsLoaded(true);
    }, []);

    const loadRequests = useCallback(async () => {
        setLoading(true);
        const [r, p] = await Promise.all([
            api(`airtime-cash?per_page=50${status ? `&status=${status}` : ""}`),
            api("airtime-cash?per_page=1&status=PENDING"),
        ]);
        if (r.ok) setRequests(r.data.requests || []);
        if (p.ok) setPendingCount(p.data.total || 0);
        setLoading(false);
    }, [status]);

    useEffect(() => { loadSettings(); }, [loadSettings]);
    useEffect(() => { loadRequests(); }, [loadRequests]);

    // ---------------- setup ----------------
    const edit = (network: string, patch: Partial<NetworkSetting>) => {
        setNets((ns) => ns.map((n) => (n.network === network ? { ...n, ...patch } : n)));
        setCardMsg((m) => { const c = { ...m }; delete c[network]; return c; });
    };

    const changed = (n: NetworkSetting) => {
        const o = saved[n.network];
        return !o || o.switched_on !== n.switched_on || (o.collection_phone || "") !== (n.collection_phone || "")
            || o.rate_percent !== n.rate_percent || o.min !== n.min || o.max !== n.max;
    };

    const saveNetwork = async (n: NetworkSetting) => {
        if (Object.keys(fieldProblems(n)).length) return;
        setSavingNet(n.network);
        const r = await api("airtime-cash/settings", "PUT", {
            networks: [{
                network: n.network, enabled: n.switched_on, collection_phone: n.collection_phone || "",
                rate_percent: n.rate_percent, min_naira: n.min, max_naira: n.max,
            }],
        });
        setSavingNet(null);
        if (!r.ok) { setCardMsg((m) => ({ ...m, [n.network]: { ok: false, text: r.message } })); return; }
        const fresh: NetworkSetting = r.data.networks.find((x: NetworkSetting) => x.network === n.network);
        const problem = r.data.problems?.[n.network];
        const note = r.data.notes?.[n.network];
        if (!problem && fresh) {
            setNets((ns) => ns.map((x) => (x.network === n.network ? fresh : x)));
            setSaved((sv) => ({ ...sv, [n.network]: fresh }));
        }
        setCardMsg((m) => ({
            ...m, [n.network]: problem ? { ok: false, text: problem }
                : { ok: true, text: note || (fresh?.enabled ? "Saved. Customers can use it now." : "Saved. Off for customers.") },
        }));
    };

    const saveMode = async (next: "manual" | "auto") => {
        if (next === mode) return;
        setModeMsg(null);
        setModeSaving(true);
        const r = await api("airtime-cash/settings", "PUT", { mode: next });
        setModeSaving(false);
        if (!r.ok) { setModeMsg({ ok: false, text: r.message }); return; }
        applySettings(r.data);
        setModeMsg({ ok: true, text: "Saved." });
    };

    // ---------------- requests ----------------
    const act = async (req: A2CRequest, action: "approve" | "reject") => {
        let body: Record<string, unknown> = {};
        if (action === "approve") {
            const got = received[req.id];
            if (got && !(Number(got) > 0 && Number(got) <= req.amount_naira)) {
                setReqMsg((m) => ({ ...m, [req.id]: { ok: false, text: `Received must be between ₦1 and ${naira(req.amount_naira)}` } }));
                return;
            }
            if (got) body.received_naira = Number(got);
            const amount = got ? Number(got) : req.amount_naira;
            const pay = Math.floor(amount * req.rate_percent) / 100;
            if (!confirm(`Confirm ${naira(amount)} ${NAMES[req.network] || req.network} airtime arrived from ${req.phone_from}?\n\n${naira(pay)} will be added to ${req.user_email}'s wallet.`)) return;
        } else {
            const note = prompt("Reason for rejecting (the customer sees this):", "Airtime not received");
            if (note === null) return;
            body = { note };
        }
        setBusy(req.id);
        const r = await api(`airtime-cash/${req.id}/${action}`, "POST", body);
        setBusy(null);
        setReqMsg((m) => ({ ...m, [req.id]: { ok: r.ok, text: r.message } }));
        if (r.ok) loadRequests();
    };

    const liveCount = Object.values(saved).filter((n) => n.enabled).length;

    // ---------------- render ----------------
    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Airtime to Cash</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {mode === "manual" ? "Customers send airtime to your numbers; you confirm it arrived and their wallet is credited."
                            : "The automatic provider converts airtime and credits customers instantly."}
                    </p>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:gap-3">
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Waiting</p>
                        <p className="text-lg font-bold text-orange-600">{pendingCount}</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Live</p>
                        <p className="text-lg font-bold text-green-700">{liveCount}/4</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-200 px-4 py-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-gray-500">Mode</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">{mode === "manual" ? "Manual" : "Automatic"}</p>
                    </div>
                </div>
            </div>

            {/* TABS */}
            <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 w-full sm:w-fit">
                {([["requests", "Requests", Inbox], ["setup", "Setup", Settings2]] as const).map(([key, label, Icon]) => (
                    <button key={key} onClick={() => setTab(key)}
                        className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === key ? "bg-blue-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"}`}>
                        <Icon className="w-4 h-4" /> {label}
                        {key === "requests" && pendingCount > 0 && (
                            <span className={`text-xs rounded-full px-1.5 ${tab === key ? "bg-white/25" : "bg-orange-100 text-orange-700"}`}>{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* ================= SETUP ================= */}
            {tab === "setup" && (
                <div className="space-y-6">
                    {/* mode */}
                    <section className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold text-gray-900">How it works</h2>
                            {modeSaving ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                : modeMsg && <p className={`text-xs ${modeMsg.ok ? "text-green-700" : "text-red-600"}`}>{modeMsg.text}</p>}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <button onClick={() => saveMode("manual")}
                                className={`text-left rounded-xl border-2 p-4 transition-colors ${mode === "manual" ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                                <div className="flex items-center gap-2 font-semibold text-gray-900"><UserCheck className="w-4 h-4 text-blue-600" /> Manual</div>
                                <p className="text-xs text-gray-500 mt-1">Customers send airtime to your number. You confirm it arrived, then they&apos;re paid.</p>
                            </button>
                            <button onClick={() => autoAvailable && saveMode("auto")} disabled={!autoAvailable}
                                className={`text-left rounded-xl border-2 p-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${mode === "auto" ? "border-blue-600 bg-blue-50/50" : "border-gray-200 hover:border-gray-300"}`}>
                                <div className="flex items-center gap-2 font-semibold text-gray-900"><Zap className="w-4 h-4 text-blue-600" /> Automatic</div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {autoAvailable ? "The provider moves the airtime and pays instantly." : "Not available: needs the provider's token on the server."}
                                </p>
                            </button>
                        </div>
                    </section>

                    {/* networks */}
                    {!settingsLoaded ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                    ) : (
                        <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4">
                            {nets.map((n) => {
                                const err = fieldProblems(n);
                                const hasErr = Object.keys(err).length > 0;
                                const phoneOk = !!normalizePhone(n.collection_phone || "");
                                const needsNumber = mode === "manual" && !phoneOk;
                                const live = saved[n.network]?.enabled;
                                const dirty = changed(n);
                                const msg = cardMsg[n.network];
                                const name = NAMES[n.network] || n.network;
                                const example = !hasErr ? Math.min(Math.max(1000, n.min), n.max) : 0;
                                return (
                                    <section key={n.network} className={`bg-white rounded-xl border p-5 flex flex-col gap-4 ${live ? "border-green-300" : "border-gray-200"}`}>
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <NetworkBadge network={n.network} />
                                                <h3 className="font-semibold text-gray-900">{name}</h3>
                                            </div>
                                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${live ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {live ? "● Live" : "Off"}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Collection number {mode === "manual" && <span className="font-normal text-gray-400">(customers send airtime here)</span>}
                                            </label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input type="tel" inputMode="tel" value={n.collection_phone || ""} placeholder="08031234567"
                                                    onChange={(e) => edit(n.network, { collection_phone: e.target.value, ...(normalizePhone(e.target.value) || mode !== "manual" ? {} : { switched_on: false }) })}
                                                    className={`${inputBase} pl-9 ${err.phone ? "border-red-400" : "border-gray-200"}`} />
                                            </div>
                                            {err.phone && <p className="text-xs text-red-600 mt-1">{err.phone}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            <div className="col-span-2 sm:col-span-1">
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Customer gets</label>
                                                <div className="relative">
                                                    <input type="number" inputMode="decimal" value={Number.isNaN(n.rate_percent) ? "" : n.rate_percent}
                                                        onChange={(e) => edit(n.network, { rate_percent: e.target.value === "" ? NaN : Number(e.target.value) })}
                                                        className={`${inputBase} pr-8 ${err.rate ? "border-red-400" : "border-gray-200"}`} />
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
                                                </div>
                                                {err.rate && <p className="text-xs text-red-600 mt-1">{err.rate}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Minimum</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                                                    <input type="number" inputMode="numeric" value={Number.isNaN(n.min) ? "" : n.min}
                                                        onChange={(e) => edit(n.network, { min: e.target.value === "" ? NaN : Number(e.target.value) })}
                                                        className={`${inputBase} pl-7 ${err.min ? "border-red-400" : "border-gray-200"}`} />
                                                </div>
                                                {err.min && <p className="text-xs text-red-600 mt-1">{err.min}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Maximum</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">₦</span>
                                                    <input type="number" inputMode="numeric" value={Number.isNaN(n.max) ? "" : n.max}
                                                        onChange={(e) => edit(n.network, { max: e.target.value === "" ? NaN : Number(e.target.value) })}
                                                        className={`${inputBase} pl-7 ${err.max ? "border-red-400" : "border-gray-200"}`} />
                                                </div>
                                                {err.max && <p className="text-xs text-red-600 mt-1">{err.max}</p>}
                                            </div>
                                        </div>

                                        {!hasErr && (
                                            <div className="rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                                                <span>Example:</span>
                                                <span className="font-semibold text-gray-900">{naira(example)} airtime</span>
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="font-semibold text-green-700">{naira(Math.floor(example * n.rate_percent) / 100)} to wallet</span>
                                                <span className="text-gray-400">· allowed {naira(n.min)}–{naira(n.max)}</span>
                                            </div>
                                        )}

                                        <label className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${needsNumber ? "border-gray-100 bg-gray-50" : "border-gray-200"} cursor-pointer`}>
                                            <span className={`text-sm ${needsNumber ? "text-gray-400" : "text-gray-800"}`}>
                                                Open to customers
                                                {needsNumber && <span className="block text-xs">Add a valid collection number first</span>}
                                            </span>
                                            <span className="relative inline-flex items-center">
                                                <input type="checkbox" className="sr-only peer" checked={n.switched_on} disabled={needsNumber && !n.switched_on}
                                                    onChange={(e) => edit(n.network, { switched_on: e.target.checked })} />
                                                <span className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-green-600 peer-disabled:opacity-50 transition-colors" />
                                                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                                            </span>
                                        </label>

                                        <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3 mt-auto">
                                            <button onClick={() => saveNetwork(n)} disabled={hasErr || !dirty || savingNet === n.network}
                                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed">
                                                {savingNet === n.network ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {name}
                                            </button>
                                            {msg ? <p className={`text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>
                                                : hasErr ? <p className="text-xs text-red-600">Fix the fields in red to save</p>
                                                    : dirty ? <p className="text-xs text-orange-600">Unsaved changes</p>
                                                        : null}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    )}
                    <p className="text-xs text-gray-500">Changes only affect new requests. Each request keeps the rate the customer was shown.</p>
                </div>
            )}

            {/* ================= REQUESTS ================= */}
            {tab === "requests" && (
                <section className="bg-white rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between gap-2 p-3 sm:p-4 border-b border-gray-100">
                        <div className="flex gap-1 overflow-x-auto -mx-1 px-1">
                            {[["PENDING", "Waiting"], ["APPROVED", "Approved"], ["REJECTED", "Rejected"], ["", "All"]].map(([v, l]) => (
                                <button key={l} onClick={() => setStatus(v)}
                                    className={`whitespace-nowrap px-2.5 sm:px-3 py-1.5 rounded-full text-sm ${status === v ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{l}</button>
                            ))}
                        </div>
                        <button onClick={loadRequests} title="Refresh" className="flex-shrink-0 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> <span className="hidden sm:inline">Refresh</span>
                        </button>
                    </div>

                    {loading && requests.length === 0 ? (
                        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-14 px-4">
                            <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm text-gray-500">{status === "PENDING" ? "No requests waiting. New ones appear here." : "Nothing here."}</p>
                            {liveCount === 0 && (
                                <button onClick={() => setTab("setup")} className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800">No network is live yet: open Setup</button>
                            )}
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {requests.map((r) => {
                                const got = received[r.id];
                                const pay = got && Number(got) > 0 ? Math.floor(Number(got) * r.rate_percent) / 100 : r.payout_naira;
                                const msg = reqMsg[r.id];
                                return (
                                    <li key={r.id} className="p-4 sm:p-5">
                                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                                            {/* who + what */}
                                            <div className="flex items-start gap-3 md:w-2/5 min-w-0">
                                                <NetworkBadge network={r.network} />
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-900 truncate">{r.user_name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{r.user_email}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {r.phone_from} <ArrowRight className="inline w-3 h-3" /> {r.collection_phone || "—"}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 mt-0.5">{r.created_at ? new Date(r.created_at + "Z").toLocaleString() : ""}</p>
                                                </div>
                                            </div>
                                            {/* amounts */}
                                            <div className="flex md:flex-col gap-4 md:gap-0.5 md:w-1/5 text-sm">
                                                <p><span className="text-gray-500 text-xs block">Airtime</span><span className="font-semibold">{naira(r.amount_naira)}</span></p>
                                                <p><span className="text-gray-500 text-xs block">Pays ({r.rate_percent}%)</span><span className="font-semibold text-green-700">{naira(pay)}</span></p>
                                            </div>
                                            {/* actions */}
                                            <div className="md:flex-1">
                                                {r.status === "PENDING" ? (
                                                    <div className="space-y-2">
                                                        <input type="number" inputMode="numeric" placeholder="Amount received (optional)"
                                                            value={got || ""} onChange={(e) => setReceived({ ...received, [r.id]: e.target.value })}
                                                            className={`${inputBase} border-gray-200`} />
                                                        <p className="text-[11px] text-gray-400 -mt-1">Leave empty if the full {naira(r.amount_naira)} arrived.</p>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <button onClick={() => act(r, "approve")} disabled={busy === r.id}
                                                                className="inline-flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white px-3 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                                                                {busy === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Confirm
                                                            </button>
                                                            <button onClick={() => act(r, "reject")} disabled={busy === r.id}
                                                                className="inline-flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 px-3 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-60">
                                                                <X className="w-4 h-4" /> Reject
                                                            </button>
                                                        </div>
                                                        {msg && <p className={`text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.text}</p>}
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${r.status === "APPROVED" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                                            {r.status === "APPROVED" ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />} {r.status === "APPROVED" ? "Approved" : "Rejected"}
                                                        </span>
                                                        {r.admin_note && <p className="text-xs text-gray-500 mt-1.5">{r.admin_note}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    {status === "PENDING" && requests.length > 0 && (
                        <p className="text-xs text-gray-400 px-5 py-3 border-t border-gray-100">Only confirm once the airtime shows on the collection line.</p>
                    )}
                </section>
            )}
        </div>
    );
}
