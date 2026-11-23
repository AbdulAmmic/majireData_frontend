"use client";

import { API_BASE_URL } from "@/config";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, ArrowRight, Loader2, ShieldCheck, CheckCircle2, Clock, XCircle, Landmark, BadgeCheck } from "lucide-react";
import MessageModal from "@/components/messageModal";

type Info = {
    enabled: boolean;
    bvn_verified: boolean;
    bvn_last4: string | null;
    has_pin: boolean;
    full_name: string;
    balance_naira: number;
    withdrawn_today_naira: number;
    fee_naira: number;
    min_naira: number;
    max_naira: number;
    daily_limit_naira: number;
    approval_above_naira: number;
};

type Bank = { code: string; name: string };

type Withdrawal = {
    id: string;
    amount_naira: number;
    fee_naira: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: "PENDING_APPROVAL" | "PROCESSING" | "SUCCESS" | "FAILED" | "REJECTED";
    error: string | null;
    refunded: boolean;
    created_at: string;
};

const naira = (n: number) => `₦${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const STATUS: Record<Withdrawal["status"], { label: string; className: string }> = {
    PENDING_APPROVAL: { label: "Awaiting approval", className: "bg-orange-100 text-orange-700" },
    PROCESSING: { label: "Processing", className: "bg-blue-100 text-blue-700" },
    SUCCESS: { label: "Sent", className: "bg-green-100 text-green-700" },
    FAILED: { label: "Failed · refunded", className: "bg-red-100 text-red-700" },
    REJECTED: { label: "Rejected · refunded", className: "bg-red-100 text-red-700" },
};

export default function WithdrawPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("withdraw");

    const [modalOpen, setModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState<{ title: string; message: string; type: "success" | "error" | "warning" }>({ title: "", message: "", type: "success" });
    const showMessage = (title: string, message: string, type: "success" | "error" | "warning" = "success") => {
        setModalConfig({ title, message, type });
        setModalOpen(true);
    };

    const [info, setInfo] = useState<Info | null>(null);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [history, setHistory] = useState<Withdrawal[]>([]);
    const [loading, setLoading] = useState(false);

    const [bvn, setBvn] = useState({ bvn: "", transaction_pin: "" });
    const [form, setForm] = useState({ bank_code: "", account_number: "", amount_naira: "", transaction_pin: "" });
    const [resolved, setResolved] = useState<{ name: string; matches: boolean } | null>(null);
    const [resolving, setResolving] = useState(false);

    const api = useCallback(async (path: string, body?: Record<string, unknown>) => {
        const token = localStorage.getItem("token");
        if (!token) return { ok: false, message: "Please log in again", data: {} as any };
        try {
            const res = await fetch(`${API_BASE_URL}/api/wallet/${path}`, {
                method: body ? "POST" : "GET",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: body ? JSON.stringify(body) : undefined,
            });
            const json = await res.json();
            return { ok: res.ok && json.success !== false, message: json.message || "Something went wrong", data: json.data || {} };
        } catch {
            return { ok: false, message: "Network problem. Please check your connection and try again.", data: {} as any };
        }
    }, []);

    const loadInfo = useCallback(async () => {
        const r = await api("withdraw/info");
        if (r.ok) setInfo(r.data);
    }, [api]);

    const loadHistory = useCallback(async () => {
        const r = await api("withdrawals");
        if (r.ok) setHistory(r.data.items || []);
    }, [api]);

    useEffect(() => {
        loadInfo();
        loadHistory();
    }, [loadInfo, loadHistory]);

    useEffect(() => {
        if (!info?.bvn_verified || banks.length) return;
        api("banks").then((r) => { if (r.ok) setBanks(r.data.banks || []); });
    }, [info?.bvn_verified, banks.length, api]);

    // Keep checking withdrawals that are still on their way.
    useEffect(() => {
        const open = history.filter((w) => w.status === "PROCESSING");
        if (!open.length) return;
        const t = setTimeout(async () => {
            const updates = await Promise.all(open.map((w) => api(`withdrawals/${w.id}`)));
            const changed = updates.filter((u) => u.ok).map((u) => u.data as Withdrawal);
            setHistory((h) => h.map((w) => changed.find((c) => c.id === w.id) || w));
            if (changed.some((c) => c.status !== "PROCESSING")) loadInfo();
        }, 25000);
        return () => clearTimeout(t);
    }, [history, api, loadInfo]);

    // Look the account name up as soon as there's a full account number.
    useEffect(() => {
        setResolved(null);
        const acct = form.account_number.replace(/\s/g, "");
        if (!form.bank_code || !/^\d{10}$/.test(acct)) return;
        const t = setTimeout(async () => {
            setResolving(true);
            const r = await api("withdraw/resolve", { bank_code: form.bank_code, account_number: acct });
            setResolving(false);
            if (r.ok) setResolved({ name: r.data.account_name, matches: r.data.name_matches });
            else setResolved({ name: r.message, matches: false });
        }, 500);
        return () => clearTimeout(t);
    }, [form.bank_code, form.account_number, api]);

    const verifyBvn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const r = await api("bvn/verify", bvn);
        setLoading(false);
        setBvn({ bvn: "", transaction_pin: "" });
        if (!r.ok) { showMessage("BVN not verified", r.message, "error"); return; }
        showMessage("BVN verified", r.message, "success");
        loadInfo();
    };

    const amount = Number(form.amount_naira) || 0;
    const fee = info?.fee_naira ?? 0;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolved?.matches) {
            showMessage("Check the account", "You can only withdraw to an account in your own name.", "warning");
            return;
        }
        setLoading(true);
        const r = await api("withdraw", {
            bank_code: form.bank_code,
            account_number: form.account_number.replace(/\s/g, ""),
            amount_naira: amount,
            transaction_pin: form.transaction_pin,
        });
        setLoading(false);
        setForm((f) => ({ ...f, transaction_pin: "" }));
        if (!r.ok) { showMessage("Withdrawal not sent", r.message, "error"); return; }
        const st = (r.data as Withdrawal).status;
        showMessage(st === "FAILED" ? "Withdrawal failed" : "Withdrawal received", r.message, st === "FAILED" ? "error" : "success");
        setForm({ bank_code: form.bank_code, account_number: "", amount_naira: "", transaction_pin: "" });
        loadInfo();
        loadHistory();
    };

    const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none";
    const primaryBtn = "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70";

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            <MessageModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={modalConfig.title} message={modalConfig.message} type={modalConfig.type} />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />
            {sidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col">
                <Header setSidebarOpen={setSidebarOpen} />

                <main className="flex-1 p-6 max-w-4xl mx-auto w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                        <ChevronRight className="h-4 w-4" />
                        <span className="text-gray-900 font-medium">Withdraw</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* SUMMARY */}
                        <div className="bg-blue-600 rounded-2xl p-8 text-white h-fit space-y-6">
                            <div>
                                <p className="text-blue-100 text-sm">Wallet balance</p>
                                <p className="text-3xl font-bold">{naira(info?.balance_naira ?? 0)}</p>
                            </div>
                            <div className="bg-white/10 rounded-xl p-4 text-sm space-y-2">
                                <p className="flex justify-between"><span className="text-blue-100">Fee per withdrawal</span><span>{naira(fee)}</span></p>
                                <p className="flex justify-between"><span className="text-blue-100">Per withdrawal</span><span>{naira(info?.min_naira ?? 0)} – {naira(info?.max_naira ?? 0)}</span></p>
                                <p className="flex justify-between"><span className="text-blue-100">Used today</span><span>{naira(info?.withdrawn_today_naira ?? 0)} of {naira(info?.daily_limit_naira ?? 0)}</span></p>
                            </div>
                            <div className="text-sm space-y-2 text-blue-100">
                                <p className="flex items-start gap-2"><ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" /> Money can only go to a bank or PalmPay account in your own name.</p>
                                <p className="flex items-start gap-2"><Clock className="w-4 h-4 mt-0.5 flex-shrink-0" /> Withdrawals above {naira(info?.approval_above_naira ?? 0)} are checked by our team before they're sent.</p>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            {!info ? (
                                <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                            ) : !info.enabled ? (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">Withdrawals are not available right now. Please check back later.</div>
                            ) : !info.has_pin ? (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                                    Set your transaction PIN first in <Link href="/settings" className="underline font-medium">Settings</Link>.
                                </div>
                            ) : !info.bvn_verified ? (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Verify your BVN</h2>
                                    <p className="text-sm text-gray-500 mb-6">
                                        To keep withdrawals safe we need to confirm your BVN once. The name on your BVN should match your
                                        account name: <span className="font-medium text-gray-800">{info.full_name}</span>.
                                    </p>
                                    <form onSubmit={verifyBvn} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">BVN (11 digits)</label>
                                            <input type="text" inputMode="numeric" maxLength={11} value={bvn.bvn}
                                                onChange={(e) => setBvn({ ...bvn, bvn: e.target.value.replace(/\D/g, "") })}
                                                className={`${inputClass} tracking-widest`} placeholder="22xxxxxxxxx" required />
                                            <p className="text-xs text-gray-500 mt-1">Dial *565*0# to get your BVN. We only keep the last 4 digits.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                                            <input type="password" inputMode="numeric" maxLength={4} value={bvn.transaction_pin}
                                                onChange={(e) => setBvn({ ...bvn, transaction_pin: e.target.value })}
                                                className={`${inputClass} tracking-widest`} placeholder="****" required />
                                        </div>
                                        <button type="submit" disabled={loading || bvn.bvn.length !== 11} className={primaryBtn}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify BVN"}
                                            {!loading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Withdraw to bank</h2>
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded-full">
                                            <BadgeCheck className="w-3.5 h-3.5" /> BVN ••••{info.bvn_last4}
                                        </span>
                                    </div>
                                    <form onSubmit={submit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                                            <select value={form.bank_code} onChange={(e) => setForm({ ...form, bank_code: e.target.value })} className={inputClass} required>
                                                <option value="">{banks.length ? "Select bank" : "Loading banks..."}</option>
                                                {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Account number</label>
                                            <div className="relative">
                                                <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="text" inputMode="numeric" maxLength={10} value={form.account_number}
                                                    onChange={(e) => setForm({ ...form, account_number: e.target.value.replace(/\D/g, "") })}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="0123456789" required />
                                            </div>
                                            {resolving && <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Checking account...</p>}
                                            {resolved && (
                                                <p className={`text-sm mt-2 font-medium ${resolved.matches ? "text-green-700" : "text-red-600"}`}>
                                                    {resolved.matches ? `✓ ${resolved.name}` : `${resolved.name} — must be an account in your own name`}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
                                            <input type="number" min={info.min_naira} max={info.max_naira} step={1} value={form.amount_naira}
                                                onChange={(e) => setForm({ ...form, amount_naira: e.target.value })} className={inputClass} placeholder="5000" required />
                                            {amount > 0 && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {naira(amount + fee)} will leave your wallet ({naira(amount)} + {naira(fee)} fee)
                                                    {amount > info.approval_above_naira && " · needs approval"}
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Transaction PIN</label>
                                            <input type="password" inputMode="numeric" maxLength={4} value={form.transaction_pin}
                                                onChange={(e) => setForm({ ...form, transaction_pin: e.target.value })}
                                                className={`${inputClass} tracking-widest`} placeholder="****" required />
                                        </div>
                                        <button type="submit" disabled={loading || !resolved?.matches} className={primaryBtn}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Withdraw"}
                                            {!loading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* HISTORY */}
                    {history.length > 0 && (
                        <div className="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="font-semibold text-gray-900 p-5 border-b border-gray-100">Recent withdrawals</h3>
                            <ul className="divide-y divide-gray-100">
                                {history.map((w) => (
                                    <li key={w.id} className="p-5 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {w.status === "SUCCESS" ? <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                : w.status === "FAILED" || w.status === "REJECTED" ? <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                    : <Clock className="w-5 h-5 text-orange-500 flex-shrink-0" />}
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{w.account_name}</p>
                                                <p className="text-xs text-gray-500 truncate">{w.bank_name} · {w.account_number} · {new Date(w.created_at + "Z").toLocaleString()}</p>
                                                {w.error && <p className="text-xs text-red-600 truncate">{w.error}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <p className="font-semibold text-gray-900">{naira(w.amount_naira)}</p>
                                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${STATUS[w.status].className}`}>{STATUS[w.status].label}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
