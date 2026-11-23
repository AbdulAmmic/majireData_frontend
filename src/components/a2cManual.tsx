"use client";

import { API_BASE_URL } from "@/config";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ArrowLeft, Loader2, Copy, CheckCircle2, Clock, XCircle, Phone } from "lucide-react";

export type ManualNetwork = {
    network: string;
    enabled: boolean;
    rate_percent: number;
    min: number;
    max: number;
    collection_phone: string | null;
};

type Request = {
    id: string;
    network: string;
    phone_from: string;
    send_to: string;
    amount_naira: number;
    rate_percent: number;
    you_receive_naira: number;
    status: "PENDING" | "APPROVED" | "REJECTED";
    note: string | null;
    created_at: string;
};

const LABELS: Record<string, string> = { MTN: "MTN", AIRTEL: "Airtel", GLO: "Glo", "9MOBILE": "9Mobile" };

// Usual airtime-transfer codes. Networks change these from time to time, so they're shown as a hint.
const shareCode = (network: string, to: string, amount: number) => ({
    MTN: `*600*${to}*${amount}*PIN#`,
    GLO: `*131*${to}*${amount}*PIN#`,
    "9MOBILE": `*223*PIN*${amount}*${to}#`,
    AIRTEL: "*432# → Transfer airtime",
}[network]);

const naira = (n: number) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function A2CManual({ networks, onMessage }: {
    networks: Record<string, ManualNetwork>;
    onMessage: (title: string, message: string, type?: "success" | "error" | "warning") => void;
}) {
    const [step, setStep] = useState<"details" | "send" | "confirm">("details");
    const [form, setForm] = useState({ network: "", amount: "", phone_from: "", transaction_pin: "" });
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);
    const [copied, setCopied] = useState(false);

    const open = Object.values(networks).filter((n) => n.enabled);
    const net = networks[form.network];
    const amount = Number(form.amount) || 0;
    const receive = net ? Math.floor(amount * net.rate_percent) / 100 : 0;

    const load = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/services/airtime/cash`, { headers: { Authorization: `Bearer ${token}` } });
            const json = await res.json();
            if (json?.success) setRequests(json.data.requests || []);
        } catch { /* list is optional */ }
    }, []);

    useEffect(() => { load(); }, [load]);

    const next = (e: React.FormEvent) => {
        e.preventDefault();
        if (!net) return;
        if (amount < net.min || amount > net.max) {
            onMessage("Check the amount", `${LABELS[net.network]} amount must be between ${naira(net.min)} and ${naira(net.max)}`, "warning");
            return;
        }
        setStep("send");
    };

    const copy = async () => {
        if (!net?.collection_phone) return;
        try { await navigator.clipboard.writeText(net.collection_phone); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        if (!token) return;
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/services/airtime/cash`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ network: form.network, amount, phone_from: form.phone_from, transaction_pin: form.transaction_pin }),
            });
            const json = await res.json();
            if (!res.ok || json.success === false) { onMessage("Not submitted", json.message || "Something went wrong", "error"); return; }
            onMessage("Request submitted", `We'll confirm your ${naira(amount)} airtime and add ${naira(json.data.you_receive_naira)} to your wallet.`, "success");
            setForm({ network: "", amount: "", phone_from: "", transaction_pin: "" });
            setStep("details");
            load();
        } catch {
            onMessage("Network problem", "Please check your connection and try again.", "error");
        } finally {
            setForm((f) => ({ ...f, transaction_pin: "" }));
            setLoading(false);
        }
    };

    const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none";
    const primaryBtn = "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70";

    return (
        <>
            {open.length === 0 && (
                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">Airtime to Cash is not available right now. Please check back later.</div>
            )}

            {step === "details" && (
                <>
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Convert airtime to cash</h2>
                    <form onSubmit={next} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                            <select value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })} className={inputClass} required>
                                <option value="">Select Network</option>
                                {open.map((n) => <option key={n.network} value={n.network}>{LABELS[n.network] || n.network} · {n.rate_percent}%</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Airtime amount (₦)</label>
                            <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className={inputClass} placeholder="1000" required />
                            {net && <p className="text-xs text-gray-500 mt-1">{LABELS[net.network]}: {naira(net.min)} – {naira(net.max)} · rate {net.rate_percent}%</p>}
                            {net && amount > 0 && <p className="text-sm text-green-700 mt-2">You will receive <span className="font-bold">{naira(receive)}</span> in your wallet</p>}
                        </div>
                        <button type="submit" disabled={!open.length} className={primaryBtn}>Continue <ArrowRight className="w-5 h-5" /></button>
                    </form>
                </>
            )}

            {step === "send" && net && (
                <>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Send the airtime</h2>
                    <p className="text-sm text-gray-500 mb-6">Transfer exactly <span className="font-semibold text-gray-800">{naira(amount)}</span> {LABELS[net.network]} airtime to:</p>
                    <div className="bg-blue-50 rounded-xl p-5 text-center mb-4">
                        <p className="text-3xl font-bold tracking-wider text-blue-700">{net.collection_phone}</p>
                        <button type="button" onClick={copy} className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800">
                            <Copy className="w-4 h-4" /> {copied ? "Copied" : "Copy number"}
                        </button>
                    </div>
                    {net.collection_phone && (
                        <p className="text-xs text-gray-500 mb-6">
                            Usual code: <span className="font-mono text-gray-700">{shareCode(net.network, net.collection_phone, amount)}</span> (use your SIM&apos;s transfer PIN).
                        </p>
                    )}
                    <div className="space-y-3">
                        <button type="button" onClick={() => setStep("confirm")} className={primaryBtn}>I have sent it <ArrowRight className="w-5 h-5" /></button>
                        <button type="button" onClick={() => setStep("details")} className="w-full text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Change details
                        </button>
                    </div>
                </>
            )}

            {step === "confirm" && net && (
                <>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm your transfer</h2>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Sent to</span><span className="font-medium">{net.collection_phone}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Airtime</span><span className="font-medium">{naira(amount)} {LABELS[net.network]}</span></div>
                        <div className="flex justify-between border-t pt-2"><span className="text-gray-500">You receive</span><span className="font-bold text-green-700">{naira(receive)}</span></div>
                    </div>
                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number you sent from</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input type="tel" value={form.phone_from} onChange={(e) => setForm({ ...form, phone_from: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08012345678" required />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Transaction PIN</label>
                            <input type="password" inputMode="numeric" maxLength={4} value={form.transaction_pin}
                                onChange={(e) => setForm({ ...form, transaction_pin: e.target.value })} className={`${inputClass} tracking-widest`} placeholder="****" required />
                        </div>
                        <button type="submit" disabled={loading} className={primaryBtn}>
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit for confirmation"}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                        <button type="button" onClick={() => setStep("send")} className="w-full text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    </form>
                </>
            )}

            {requests.length > 0 && (
                <div className="mt-8 border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Your requests</h3>
                    <ul className="space-y-3">
                        {requests.map((r) => (
                            <li key={r.id} className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex items-center gap-2 min-w-0">
                                    {r.status === "APPROVED" ? <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        : r.status === "REJECTED" ? <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                            : <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />}
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-900">{naira(r.amount_naira)} {LABELS[r.network] || r.network}</p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {r.status === "APPROVED" ? "Credited" : r.status === "REJECTED" ? (r.note || "Not received") : "Waiting for confirmation"} · {new Date(r.created_at + "Z").toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-semibold flex-shrink-0 ${r.status === "REJECTED" ? "text-gray-400 line-through" : "text-green-700"}`}>{naira(r.you_receive_naira)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );
}
