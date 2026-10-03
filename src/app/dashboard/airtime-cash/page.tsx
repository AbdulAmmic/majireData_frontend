"use client";

import { API_BASE_URL } from "@/config";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, ArrowRight, ArrowLeft, Loader2, Phone, ShieldCheck, CheckCircle2, Clock } from "lucide-react";
import MessageModal from "@/components/messageModal";

type Step = "details" | "otp" | "confirm" | "done";

type Info = {
    enabled: boolean;
    payout_percent: number;
    networks: Record<string, { min: number; max: number }>;
};

const FALLBACK_LIMITS: Record<string, { min: number; max: number }> = {
    MTN: { min: 50, max: 10000 },
    AIRTEL: { min: 50, max: 20000 },
    GLO: { min: 50, max: 1000 },
    "9MOBILE": { min: 50, max: 20000 },
};

export default function AirtimeToCashPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("service");

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

    const [step, setStep] = useState<Step>("details");
    const [loading, setLoading] = useState(false);
    const [info, setInfo] = useState<Info | null>(null);

    const [formData, setFormData] = useState({
        network: "",
        amount: "",
        phone_from: "",
        otp: "",
        sim_pin: "",
        transaction_pin: ""
    });
    const [session, setSession] = useState<{ id: string; balance?: string; tariff?: string } | null>(null);
    const [result, setResult] = useState<{ status: string; message: string; credited?: number } | null>(null);

    const networks = [
        { id: "MTN", name: "MTN" },
        { id: "AIRTEL", name: "Airtel" },
        { id: "GLO", name: "Glo" },
        { id: "9MOBILE", name: "9Mobile" }
    ];

    const limits = info?.networks ?? FALLBACK_LIMITS;
    const payoutPercent = info?.payout_percent ?? 85;
    const amountNum = Number(formData.amount) || 0;
    const youReceive = Math.floor(amountNum * payoutPercent) / 100;

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        fetch(`${API_BASE_URL}/api/services/airtime/cash/info`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => { if (d?.success) setInfo(d.data); })
            .catch(() => { /* the page still works with the built-in limits */ });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // one place for every call: returns { ok, message, data }
    const call = async (path: string, body: Record<string, unknown>) => {
        const token = localStorage.getItem("token");
        if (!token) return { ok: false, message: "Please log in again", data: {} as any };
        try {
            const res = await fetch(`${API_BASE_URL}/api/services/airtime/cash/${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(body)
            });
            const json = await res.json();
            return { ok: res.ok && json.success !== false, message: json.message || "Something went wrong", data: json.data || {} };
        } catch {
            return { ok: false, message: "Network problem. Please check your connection and try again.", data: {} as any };
        }
    };

    const resetAll = () => {
        setFormData({ network: "", amount: "", phone_from: "", otp: "", sim_pin: "", transaction_pin: "" });
        setSession(null);
        setResult(null);
        setStep("details");
    };

    // STEP 1 -> send the code
    const sendCode = async (e?: React.FormEvent) => {
        e?.preventDefault();
        const lim = limits[formData.network];
        if (lim && (amountNum < lim.min || amountNum > lim.max)) {
            showMessage("Check the amount", `${formData.network} amount must be between ₦${lim.min.toLocaleString()} and ₦${lim.max.toLocaleString()}`, "warning");
            return;
        }
        setLoading(true);
        const r = await call("otp", { network: formData.network, phone_from: formData.phone_from, amount: amountNum });
        setLoading(false);
        if (!r.ok) { showMessage("Could not send code", r.message, "error"); return; }
        setFormData((f) => ({ ...f, otp: "" }));
        setStep("otp");
        showMessage("Code sent", r.data?.message || "We sent a code to your phone by SMS.", "success");
    };

    // STEP 2 -> confirm the code
    const verifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const r = await call("verify", { network: formData.network, phone_from: formData.phone_from, otp: formData.otp });
        setLoading(false);
        if (!r.ok) { showMessage("Verification failed", r.message, "error"); return; }
        setSession({ id: r.data.session_id, balance: r.data.airtime_balance, tariff: r.data.tariff });
        setStep("confirm");
    };

    // STEP 3 -> convert
    const convert = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session) return;
        setLoading(true);
        const r = await call("transfer", {
            network: formData.network,
            phone_from: formData.phone_from,
            amount: amountNum,
            session_id: session.id,
            sim_pin: formData.sim_pin,
            transaction_pin: formData.transaction_pin
        });
        setLoading(false);
        // never keep the SIM PIN around
        setFormData((f) => ({ ...f, sim_pin: "", transaction_pin: "" }));

        if (!r.ok) {
            showMessage("Transfer not completed", r.message, "error");
            if (/session expired/i.test(r.message)) { setSession(null); setStep("details"); }
            return;
        }
        setResult({ status: r.data.status, message: r.message, credited: r.data.credited_naira });
        setStep("done");
    };

    const inputClass = "w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none";
    const primaryBtn = "w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70";

    const stepNumber = { details: 1, otp: 2, confirm: 3, done: 3 }[step];

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
                        <span className="text-gray-900 font-medium">Airtime to Cash</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* HOW IT WORKS */}
                        <div className="bg-blue-600 rounded-2xl p-8 text-white h-fit">
                            <h2 className="text-2xl font-bold mb-4">How it works</h2>
                            <div className="space-y-6">
                                {[
                                    ["1", "Enter your details", "Pick the network, the amount and the phone number the airtime is on."],
                                    ["2", "Confirm by SMS", "We text a code to that phone. Enter it to prove the number is yours."],
                                    ["3", "Convert", "Enter your SIM's airtime-transfer PIN. The airtime is moved automatically and your wallet is credited instantly."]
                                ].map(([n, title, text]) => (
                                    <div key={n} className="flex gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${Number(n) === stepNumber ? "bg-white text-blue-600" : "bg-white/20"}`}>{n}</div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{title}</h3>
                                            <p className="text-blue-100 text-sm mt-1">{text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 bg-white/10 rounded-xl p-4 text-sm space-y-1">
                                <p>You receive <span className="font-bold">{payoutPercent}%</span> of the airtime you convert.</p>
                                <p className="text-blue-100 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Your SIM PIN is used once and never stored.</p>
                            </div>
                        </div>

                        {/* FORM */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            {info && !info.enabled && (
                                <div className="mb-6 p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                                    Airtime to Cash is not available right now. Please check back later.
                                </div>
                            )}

                            {/* ---------- STEP 1 ---------- */}
                            {step === "details" && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Convert airtime to cash</h2>
                                    <form onSubmit={sendCode} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Network</label>
                                            <select name="network" value={formData.network} onChange={handleInputChange} className={inputClass} required>
                                                <option value="">Select Network</option>
                                                {networks.map((n) => (
                                                    <option key={n.id} value={n.id}>{n.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Airtime amount (₦)</label>
                                            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className={inputClass} placeholder="1000" required />
                                            {formData.network && limits[formData.network] && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.network}: ₦{limits[formData.network].min.toLocaleString()} – ₦{limits[formData.network].max.toLocaleString()}
                                                </p>
                                            )}
                                            {amountNum > 0 && (
                                                <p className="text-sm text-green-700 mt-2">You will receive about <span className="font-bold">₦{youReceive.toLocaleString()}</span> in your wallet</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone number with the airtime</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input type="tel" name="phone_from" value={formData.phone_from} onChange={handleInputChange}
                                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                                    placeholder="08012345678" required />
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <button type="submit" disabled={loading || (info !== null && !info.enabled)} className={primaryBtn}>
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send code to my phone"}
                                                {!loading && <ArrowRight className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {/* ---------- STEP 2 ---------- */}
                            {step === "otp" && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Enter the code</h2>
                                    <p className="text-sm text-gray-500 mb-6">We sent an SMS code to <span className="font-medium text-gray-800">{formData.phone_from}</span>.</p>
                                    <form onSubmit={verifyCode} className="space-y-4">
                                        <input type="text" inputMode="numeric" name="otp" maxLength={8} value={formData.otp} onChange={handleInputChange}
                                            className={`${inputClass} text-center text-2xl tracking-[0.5em]`} placeholder="••••••" autoFocus required />
                                        <button type="submit" disabled={loading} className={primaryBtn}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify code"}
                                            {!loading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                        <div className="flex justify-between text-sm">
                                            <button type="button" onClick={() => setStep("details")} className="text-gray-500 hover:text-gray-800 flex items-center gap-1">
                                                <ArrowLeft className="w-4 h-4" /> Change details
                                            </button>
                                            <button type="button" onClick={() => sendCode()} disabled={loading} className="text-blue-600 hover:text-blue-800 font-medium">
                                                Resend code
                                            </button>
                                        </div>
                                    </form>
                                </>
                            )}

                            {/* ---------- STEP 3 ---------- */}
                            {step === "confirm" && session && (
                                <>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Confirm conversion</h2>
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm space-y-2">
                                        <div className="flex justify-between"><span className="text-gray-500">Number</span><span className="font-medium">{formData.phone_from}</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Network</span><span className="font-medium">{formData.network}</span></div>
                                        {session.balance && <div className="flex justify-between"><span className="text-gray-500">Airtime balance</span><span className="font-medium">{session.balance}</span></div>}
                                        <div className="flex justify-between"><span className="text-gray-500">Converting</span><span className="font-medium">₦{amountNum.toLocaleString()}</span></div>
                                        <div className="flex justify-between border-t pt-2"><span className="text-gray-500">You receive</span><span className="font-bold text-green-700">₦{youReceive.toLocaleString()}</span></div>
                                    </div>
                                    <form onSubmit={convert} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">SIM airtime-transfer PIN</label>
                                            <input type="password" inputMode="numeric" name="sim_pin" maxLength={8} value={formData.sim_pin} onChange={handleInputChange}
                                                className={`${inputClass} tracking-widest`} placeholder="****" required />
                                            <p className="text-xs text-gray-500 mt-1">The PIN you use for Share &amp; Sell on this SIM. Used once, never stored.</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Wallet Transaction PIN</label>
                                            <input type="password" inputMode="numeric" name="transaction_pin" maxLength={4} value={formData.transaction_pin} onChange={handleInputChange}
                                                className={`${inputClass} tracking-widest`} placeholder="****" required />
                                        </div>
                                        <button type="submit" disabled={loading} className={primaryBtn}>
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Convert now"}
                                            {!loading && <ArrowRight className="w-5 h-5" />}
                                        </button>
                                        {loading && <p className="text-xs text-center text-gray-500">This can take up to a minute. Please don&apos;t close this page.</p>}
                                    </form>
                                </>
                            )}

                            {/* ---------- DONE ---------- */}
                            {step === "done" && result && (
                                <div className="text-center py-6 space-y-4">
                                    {result.status === "APPROVED" ? (
                                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                                    ) : (
                                        <Clock className="w-16 h-16 text-yellow-500 mx-auto" />
                                    )}
                                    <h2 className="text-xl font-bold text-gray-900">
                                        {result.status === "APPROVED" ? "Wallet credited" : "Being processed"}
                                    </h2>
                                    {result.status === "APPROVED" && typeof result.credited === "number" && (
                                        <p className="text-3xl font-bold text-green-700">₦{result.credited.toLocaleString()}</p>
                                    )}
                                    <p className="text-gray-600 text-sm">{result.message}</p>
                                    <button onClick={resetAll} className={primaryBtn}>Convert more airtime</button>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
