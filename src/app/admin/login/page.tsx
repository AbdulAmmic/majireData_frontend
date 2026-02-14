"use client";

import { API_BASE_URL } from "@/config";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Shield } from "lucide-react";

export default function AdminLoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Login failed");
            }

            if (!data.data.user.roles || !data.data.user.roles.includes("admin")) {
                throw new Error("Access denied: Admin privileges required");
            }

            localStorage.setItem("token", data.data.token);
            localStorage.setItem("user", JSON.stringify(data.data.user));

            router.push("/admin/dashboard");
        } catch (error: any) {
            alert(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-4">
            {/* Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-slate-100/50 blur-3xl" />
                <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-slate-100/50 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo/Icon */}
                <div className="text-center mb-6">
                    <div className="inline-flex p-3 rounded-2xl bg-slate-900 text-white shadow-lg mb-4">
                        <Shield className="h-6 w-6" />
                    </div>
                    <h1 className="text-3xl font-light tracking-tight text-slate-900">
                        Admin Portal
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-light">
                        Secure access for administrators
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 ml-1">
                                Email
                            </label>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-slate-900/5 rounded-xl transition-all duration-200 ${focusedField === 'email' ? 'scale-105 opacity-100' : 'opacity-0'
                                    }`} />
                                <div className="relative flex items-center">
                                    <Mail className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${focusedField === 'email' ? 'text-slate-900' : 'text-slate-400'
                                        }`} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl 
                                                 focus:outline-none focus:border-slate-400 focus:ring-0
                                                 placeholder:text-slate-400 text-slate-900 transition-all duration-200"
                                        placeholder="admin@company.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700 ml-1">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    Forgot?
                                </button>
                            </div>
                            <div className="relative group">
                                <div className={`absolute inset-0 bg-slate-900/5 rounded-xl transition-all duration-200 ${focusedField === 'password' ? 'scale-105 opacity-100' : 'opacity-0'
                                    }`} />
                                <div className="relative flex items-center">
                                    <Lock className={`absolute left-4 h-4 w-4 transition-colors duration-200 ${focusedField === 'password' ? 'text-slate-900' : 'text-slate-400'
                                        }`} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl 
                                                 focus:outline-none focus:border-slate-400 focus:ring-0
                                                 placeholder:text-slate-400 text-slate-900 transition-all duration-200"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="relative w-full group mt-8"
                        >
                            <div className="absolute inset-0 bg-slate-900 rounded-xl blur-md transition-all group-hover:blur-lg group-hover:opacity-80 opacity-60" />
                            <div className="relative w-full bg-slate-900 text-white py-3.5 rounded-xl font-medium 
                                          transition-all duration-200 flex items-center justify-center gap-2 
                                          disabled:opacity-70 disabled:cursor-not-allowed
                                          hover:bg-slate-800">
                                {loading ? (
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Access Dashboard</span>
                                        <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="text-center text-xs text-slate-400 mt-8">
                        Protected by enterprise-grade security by <a href="https://www.ammic.com.ng">Ammic</a>
                    </p>
                </div>
            </div>
        </div>
    );
}