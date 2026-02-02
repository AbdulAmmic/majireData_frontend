import { useState } from "react";
import { API_BASE_URL } from "@/config";
import { Lock, Loader2 } from "lucide-react";

interface PinSetupModalProps {
    onSuccess: () => void;
}

export default function PinSetupModal({ onSuccess }: PinSetupModalProps) {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (pin.length !== 4 || !/^\d+$/.test(pin)) {
            setError("PIN must be 4 digits");
            return;
        }

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE_URL}/api/auth/pin/set`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ pin, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to set PIN");

            onSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center mb-6 text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Set Transaction PIN</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Secure your wallet by setting a 4-digit PIN for all transactions.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Create PIN
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            className="w-full p-3 text-center text-lg tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="0000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm PIN
                        </label>
                        <input
                            type="password"
                            maxLength={4}
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                            className="w-full p-3 text-center text-lg tracking-widest border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="0000"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Enter login password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Setting PIN...
                            </>
                        ) : (
                            "Secure Account"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
