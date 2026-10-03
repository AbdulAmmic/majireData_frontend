"use client";

import { API_BASE_URL } from "@/config";

import { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { ChevronRight, Copy, Check, Gift, Loader2, Share2, Users, Wallet } from "lucide-react";

type Summary = {
    enabled: boolean;
    code: string;
    percent: number;
    total_invited: number;
    total_funded: number;
    total_earned_naira: number;
    referrals: { name: string; joined_at: string | null; status: "FUNDED" | "PENDING"; bonus_naira: number }[];
};

const naira = (n: number) => `₦${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function ReferralPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeView, setActiveView] = useState("referral");

    const [data, setData] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState<"code" | "link" | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { setLoading(false); setError("Please log in again."); return; }
        fetch(`${API_BASE_URL}/api/wallet/referral`, { headers: { Authorization: `Bearer ${token}` } })
            .then((r) => r.json())
            .then((d) => {
                if (d?.success) setData(d.data);
                else setError(d?.message || "Could not load your referral details.");
            })
            .catch(() => setError("Network problem. Please check your connection and try again."))
            .finally(() => setLoading(false));
    }, []);

    const link = data && typeof window !== "undefined" ? `${window.location.origin}/?ref=${data.code}` : "";
    const shareText = data
        ? `Join me on 247MiData for cheap data, airtime, cable & electricity. Sign up with my code ${data.code}: ${link}`
        : "";

    const copy = async (what: "code" | "link") => {
        if (!data) return;
        try {
            await navigator.clipboard.writeText(what === "code" ? data.code : link);
        } catch {
            // older browsers / blocked clipboard: fall back to a temporary textarea
            const ta = document.createElement("textarea");
            ta.value = what === "code" ? data.code : link;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        setCopied(what);
        setTimeout(() => setCopied(null), 2000);
    };

    const nativeShare = async () => {
        if (navigator.share) {
            try { await navigator.share({ title: "247MiData", text: shareText, url: link }); } catch { /* cancelled */ }
        } else {
            copy("link");
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50/50">
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
                        <span className="text-gray-900 font-medium">Refer &amp; Earn</span>
                    </div>

                    {loading && (
                        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                    )}

                    {!loading && error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl">{error}</div>
                    )}

                    {!loading && data && (
                        <div className="space-y-6">
                            {!data.enabled && (
                                <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm">
                                    Referral rewards are paused right now. Your code and history are kept safe.
                                </div>
                            )}

                            {/* HERO */}
                            <div className="bg-blue-600 rounded-2xl p-8 text-white">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gift className="w-7 h-7" />
                                    <h1 className="text-2xl font-bold">Invite friends, earn {data.percent}%</h1>
                                </div>
                                <p className="text-blue-100 text-sm max-w-xl">
                                    When someone you invite funds their wallet for the first time, you receive {data.percent}% of that first
                                    funding in your wallet &mdash; instantly, and automatically.
                                </p>

                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-blue-100">Your referral code</p>
                                        <div className="flex items-center justify-between gap-3 mt-1">
                                            <span className="text-2xl font-mono font-bold tracking-widest">{data.code}</span>
                                            <button onClick={() => copy("code")} className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition" aria-label="Copy code">
                                                {copied === "code" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 rounded-xl p-4">
                                        <p className="text-xs uppercase tracking-wider text-blue-100">Your invite link</p>
                                        <div className="flex items-center justify-between gap-3 mt-1">
                                            <span className="text-sm truncate">{link}</span>
                                            <button onClick={() => copy("link")} className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition flex-shrink-0" aria-label="Copy link">
                                                {copied === "link" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex flex-wrap gap-3">
                                    <a
                                        href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-3 rounded-xl hover:bg-blue-50 transition"
                                    >
                                        Share on WhatsApp
                                    </a>
                                    <button onClick={nativeShare} className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 font-semibold px-5 py-3 rounded-xl transition">
                                        <Share2 className="w-4 h-4" /> More ways to share
                                    </button>
                                </div>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <Users className="w-5 h-5 text-blue-600 mb-2" />
                                    <p className="text-sm text-gray-500">People invited</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.total_invited}</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <Check className="w-5 h-5 text-green-600 mb-2" />
                                    <p className="text-sm text-gray-500">Have funded their wallet</p>
                                    <p className="text-2xl font-bold text-gray-900">{data.total_funded}</p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                    <Wallet className="w-5 h-5 text-green-600 mb-2" />
                                    <p className="text-sm text-gray-500">Total earned</p>
                                    <p className="text-2xl font-bold text-green-700">{naira(data.total_earned_naira)}</p>
                                </div>
                            </div>

                            {/* LIST */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">Your referrals</h2>
                                {data.referrals.length === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No one has signed up with your code yet. Share your link above to get started.
                                    </p>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {data.referrals.map((r, i) => (
                                            <li key={i} className="py-3 flex items-center justify-between gap-4">
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">{r.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Joined {r.joined_at ? new Date(r.joined_at).toLocaleDateString() : "—"}
                                                    </p>
                                                </div>
                                                {r.status === "FUNDED" ? (
                                                    <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full whitespace-nowrap">
                                                        + {naira(r.bonus_naira)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-gray-600 bg-gray-100 px-3 py-1 rounded-full whitespace-nowrap">
                                                        Waiting for first funding
                                                    </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <p className="text-xs text-gray-400">
                                The reward is paid once per person, on their first wallet funding. Wallet top-ups by admin, refunds and
                                airtime-to-cash payouts do not count.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
