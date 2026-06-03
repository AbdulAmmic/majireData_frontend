"use client";

import { X, Printer, Check, Clock, AlertCircle } from "lucide-react";
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
        SUCCESS: <Check className="w-5 h-5 text-emerald-500" />,
        PENDING: <Clock className="w-5 h-5 text-amber-500" />,
        FAILED: <AlertCircle className="w-5 h-5 text-rose-500" />
    }[statusKey] || <Clock className="w-5 h-5 text-slate-500" />;

    const statusBadge = {
        SUCCESS: "text-emerald-700 bg-emerald-50 border-emerald-200",
        PENDING: "text-amber-700 bg-amber-50 border-amber-200",
        FAILED: "text-rose-700 bg-rose-50 border-rose-200"
    }[statusKey] || "text-slate-700 bg-slate-50 border-slate-200";

    const details = transaction.details || {};
    
    // Extract Beneficiary Phone
    const beneficiary = details.phone || details.mobile_number || details.meter_number || details.iuc || null;

    let tokenDisplay = null;
    if (details.tokens) {
        tokenDisplay = details.tokens;
    } else if (details.pin) {
        tokenDisplay = details.pin;
    }

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}>
            {/* Minimal Backdrop */}
            <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />

            {/* Receipt Container */}
            <div className={`relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"} overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none`}>
                
                {/* Header Action */}
                <div className="absolute top-4 right-4 print:hidden">
                    <button onClick={onClose} className="p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {/* Brand / Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">247MiData</h2>
                        <p className="text-[10px] text-slate-400 font-medium tracking-widest uppercase mt-1">Transaction Receipt</p>
                    </div>

                    {/* Status & Amount */}
                    <div className="flex flex-col items-center justify-center mb-8 border-b border-dashed border-slate-200 pb-8">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${statusBadge} mb-4`}>
                            {StatusIcon}
                            <span className="text-[10px] font-bold uppercase tracking-wider">{transaction.status}</span>
                        </div>
                        <span className="text-sm text-slate-500 mb-1">Amount Paid</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{transaction.amount}</span>
                    </div>

                    {/* Details List */}
                    <div className="space-y-4 text-sm">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Service</span>
                            <span className="font-bold text-slate-900">{transaction.service}</span>
                        </div>

                        {beneficiary && (
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 font-medium">Phone / Beneficiary</span>
                                <span className="font-bold text-slate-900">{beneficiary}</span>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Date</span>
                            <span className="font-bold text-slate-900 text-right">
                                {new Date(transaction.date).toLocaleString(undefined, { 
                                    year: 'numeric', month: 'short', day: 'numeric', 
                                    hour: '2-digit', minute: '2-digit' 
                                })}
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <span className="text-slate-500 font-medium">Reference</span>
                            <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                                {transaction.id}
                            </span>
                        </div>
                    </div>

                    {/* Token / PIN Section */}
                    {tokenDisplay && (
                        <div className="mt-6 pt-6 border-t border-dashed border-slate-200">
                            <p className="text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">Token / PIN</p>
                            <div className="bg-slate-50 p-4 rounded-xl text-center font-mono text-lg font-black tracking-widest text-slate-900 border border-slate-200">
                                {tokenDisplay}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="mt-8 pt-6 border-t border-slate-100 print:hidden">
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors text-sm"
                        >
                            <Printer className="w-4 h-4" />
                            Print Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
