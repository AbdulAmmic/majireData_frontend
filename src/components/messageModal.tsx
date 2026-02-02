"use client";

import { AlertCircle, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useEffect, useState } from "react";

interface MessageModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
}

export default function MessageModal({ isOpen, onClose, title, message, type }: MessageModalProps) {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            setTimeout(() => setShow(false), 200); // Wait for exit animation
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    const config = {
        success: {
            icon: <CheckCircle className="w-12 h-12 text-green-500" />,
            bg: "bg-green-50",
            border: "border-green-100",
            button: "bg-green-600 hover:bg-green-700",
            titleColor: "text-green-900",
        },
        error: {
            icon: <AlertCircle className="w-12 h-12 text-red-500" />,
            bg: "bg-red-50",
            border: "border-red-100",
            button: "bg-red-600 hover:bg-red-700",
            titleColor: "text-red-900",
        },
        warning: {
            icon: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
            bg: "bg-yellow-50",
            border: "border-yellow-100",
            button: "bg-yellow-600 hover:bg-yellow-700",
            titleColor: "text-yellow-900",
        },
    }[type];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all duration-300 ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
                    } overflow-hidden`}
            >
                <div className="absolute top-4 right-4">
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className={`p-4 rounded-full ${config.bg} mb-6 animate-bounce-slow`}>
                        {config.icon}
                    </div>

                    <h3 className={`text-xl font-bold mb-2 ${config.titleColor}`}>
                        {title}
                    </h3>

                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-3.5 px-6 rounded-xl text-white font-semibold shadow-lg shadow-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] ${config.button}`}
                    >
                        {type === "error" ? "Try Again" : "Continue"}
                    </button>
                </div>
            </div>
        </div>
    );
}
