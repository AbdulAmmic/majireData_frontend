"use client";

import { X, Printer, Share2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface ReceiptModalProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: any;
}

export default function ReceiptModal({ isOpen, onClose, transaction }: ReceiptModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) setShow(true);
        else setTimeout(() => setShow(false), 200);
    }, [isOpen]);

    if (!show && !isOpen) return null;
    if (!transaction) return null;

    const handlePrint = () => {
        window.print();
    };

    const statusKey = transaction.status as "SUCCESS" | "PENDING" | "FAILED";

    const StatusIcon = {
        SUCCESS: <CheckCircle className="w-12 h-12 text-green-500" />,
        PENDING: <Clock className="w-12 h-12 text-yellow-500" />,
        FAILED: <AlertCircle className="w-12 h-12 text-red-500" />
    }[statusKey] || <Clock className="w-12 h-12 text-gray-500" />;

    const statusColor = {
        SUCCESS: "text-green-600 bg-green-50 border-green-100",
        PENDING: "text-yellow-600 bg-yellow-50 border-yellow-100",
        FAILED: "text-red-600 bg-red-50 border-red-100"
    }[statusKey] || "text-gray-600 bg-gray-50 border-gray-100";

    // Safely extract details
    const details = transaction.details || {};
    const providerResp = transaction.details?.provider || {}; // Sometimes provider details are deeper?
    // Based on backend: details = json.loads(p.response_payload)

    // Attempt to find Token/PIN
    // EPIN: tokens (string or list)
    // DATA/AIRTIME: usually just status, but maybe some ref
    // AIRTIME PIN: pin info

    let tokenDisplay = null;

    // Check for tokens/pins in various places
    if (details.tokens) {
        tokenDisplay = (
            <div className="bg-gray-100 p-4 rounded-lg text-center font-mono text-lg tracking-widest border border-dashed border-gray-300">
                {details.tokens}
            </div>
        );
    } else if (details.pin) { // Sometimes standardized as pin
        tokenDisplay = (
            <div className="bg-gray-100 p-4 rounded-lg text-center font-mono text-lg tracking-widest border border-dashed border-gray-300">
                {details.pin}
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} overflow-hidden print:shadow-none print:w-full print:max-w-none`}>

                {/* Header Pattern */}
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')]"></div>
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="absolute top-0 right-0 p-4">
                        <button onClick={onClose} className="bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors print:hidden">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="px-8 pb-8 -mt-12 relative">
                    <div className="flex flex-col items-center">
                        <div className="bg-white p-2 rounded-full shadow-lg mb-4">
                            {StatusIcon}
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-1">Transaction Receipt</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColor}`}>
                            {transaction.status}
                        </span>

                        <div className="w-full mt-8 space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm">Service</span>
                                <span className="font-semibold text-gray-900">{transaction.service}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm">Amount</span>
                                <span className="font-bold text-xl text-gray-900">{transaction.amount}</span>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm">Date</span>
                                <span className="font-medium text-gray-900 text-sm text-right">
                                    {new Date(transaction.date).toLocaleString()}
                                </span>
                            </div>

                            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                <span className="text-gray-500 text-sm">Reference</span>
                                <span className="font-mono text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                    {transaction.id}
                                </span>
                            </div>

                            {/* Dynamic Details */}
                            {details.mobile_number && (
                                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                                    <span className="text-gray-500 text-sm">Beneficiary</span>
                                    <span className="font-medium text-gray-900">{details.mobile_number}</span>
                                </div>
                            )}

                            {tokenDisplay && (
                                <div className="mt-4">
                                    <div className="text-center text-sm text-gray-500 mb-2">Token / PIN</div>
                                    {tokenDisplay}
                                </div>
                            )}

                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 w-full mt-8 print:hidden">
                            <button
                                onClick={handlePrint}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
                            >
                                <Printer className="w-4 h-4" />
                                Print
                            </button>
                            {/* Share button could use navigator.share if available */}
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-400">Thank you for using 247MiData</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
