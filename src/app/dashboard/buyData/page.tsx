"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { 
  ChevronRight, 
  Loader2, 
  Wifi, 
  Shield, 
  Phone, 
  Zap, 
  CheckCircle, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  BadgeCheck,
  Sparkles
} from "lucide-react";

type NetworkKey = "mtn" | "airtel" | "glo" | "9mobile";
type PlanTypeKey = "sme" | "gifting" | "corporate";

type DataPlan = {
  id: string;
  label: string;
  amount: number;
  size: string;
  validity: string;
  popular?: boolean;
};

const NETWORKS: { key: NetworkKey; name: string; color: string }[] = [
  { key: "mtn", name: "MTN", color: "bg-yellow-500" },
  { key: "airtel", name: "Airtel", color: "bg-red-500" },
  { key: "glo", name: "Glo", color: "bg-green-500" },
  { key: "9mobile", name: "9mobile", color: "bg-teal-500" },
];

const PLAN_TYPES: { key: PlanTypeKey; name: string; description: string; icon: React.ReactNode }[] = [
  { 
    key: "sme", 
    name: "SME", 
    description: "Best rates for individuals & small businesses",
    icon: <TrendingUp className="h-4 w-4" />
  },
  { 
    key: "gifting", 
    name: "Gifting", 
    description: "Share data with friends & family",
    icon: <Sparkles className="h-4 w-4" />
  },
  { 
    key: "corporate", 
    name: "Corporate", 
    description: "Bulk plans for organizations",
    icon: <BadgeCheck className="h-4 w-4" />
  },
];

const DEMO_PLANS: Record<NetworkKey, Record<PlanTypeKey, DataPlan[]>> = {
  mtn: {
    sme: [
      { id: "mtn-sme-500mb", label: "500MB", amount: 200, size: "500MB", validity: "30 Days" },
      { id: "mtn-sme-1gb", label: "1GB", amount: 350, size: "1GB", validity: "30 Days", popular: true },
      { id: "mtn-sme-2gb", label: "2GB", amount: 700, size: "2GB", validity: "30 Days" },
      { id: "mtn-sme-3gb", label: "3GB", amount: 950, size: "3GB", validity: "30 Days" },
      { id: "mtn-sme-5gb", label: "5GB", amount: 1500, size: "5GB", validity: "30 Days" },
    ],
    gifting: [
      { id: "mtn-gift-1gb", label: "1GB", amount: 400, size: "1GB", validity: "7 Days" },
      { id: "mtn-gift-2gb", label: "2GB", amount: 800, size: "2GB", validity: "14 Days" },
      { id: "mtn-gift-5gb", label: "5GB", amount: 1800, size: "5GB", validity: "30 Days", popular: true },
    ],
    corporate: [
      { id: "mtn-corp-10gb", label: "10GB", amount: 3300, size: "10GB", validity: "30 Days" },
      { id: "mtn-corp-20gb", label: "20GB", amount: 6200, size: "20GB", validity: "30 Days", popular: true },
      { id: "mtn-corp-50gb", label: "50GB", amount: 14500, size: "50GB", validity: "30 Days" },
    ],
  },
  airtel: {
    sme: [
      { id: "airtel-sme-1gb", label: "1GB", amount: 380, size: "1GB", validity: "30 Days", popular: true },
      { id: "airtel-sme-2gb", label: "2GB", amount: 760, size: "2GB", validity: "30 Days" },
      { id: "airtel-sme-5gb", label: "5GB", amount: 1800, size: "5GB", validity: "30 Days" },
    ],
    gifting: [
      { id: "airtel-gift-1.5gb", label: "1.5GB", amount: 650, size: "1.5GB", validity: "14 Days" },
      { id: "airtel-gift-3gb", label: "3GB", amount: 1200, size: "3GB", validity: "30 Days", popular: true },
    ],
    corporate: [
      { id: "airtel-corp-10gb", label: "10GB", amount: 3500, size: "10GB", validity: "30 Days" },
      { id: "airtel-corp-25gb", label: "25GB", amount: 8200, size: "25GB", validity: "30 Days", popular: true },
    ],
  },
  glo: {
    sme: [
      { id: "glo-sme-1gb", label: "1GB", amount: 360, size: "1GB", validity: "30 Days", popular: true },
      { id: "glo-sme-2.5gb", label: "2.5GB", amount: 780, size: "2.5GB", validity: "30 Days" },
      { id: "glo-sme-5gb", label: "5GB", amount: 1500, size: "5GB", validity: "30 Days" },
    ],
    gifting: [
      { id: "glo-gift-2gb", label: "2GB", amount: 780, size: "2GB", validity: "30 Days" },
      { id: "glo-gift-4.5gb", label: "4.5GB", amount: 1500, size: "4.5GB", validity: "30 Days", popular: true },
    ],
    corporate: [
      { id: "glo-corp-10gb", label: "10GB", amount: 3200, size: "10GB", validity: "30 Days", popular: true },
      { id: "glo-corp-20gb", label: "20GB", amount: 6000, size: "20GB", validity: "30 Days" },
    ],
  },
  "9mobile": {
    sme: [
      { id: "9m-sme-1gb", label: "1GB", amount: 420, size: "1GB", validity: "30 Days", popular: true },
      { id: "9m-sme-2gb", label: "2GB", amount: 850, size: "2GB", validity: "30 Days" },
      { id: "9m-sme-5gb", label: "5GB", amount: 1900, size: "5GB", validity: "30 Days" },
    ],
    gifting: [
      { id: "9m-gift-2gb", label: "2GB", amount: 850, size: "2GB", validity: "30 Days", popular: true },
      { id: "9m-gift-3.5gb", label: "3.5GB", amount: 1400, size: "3.5GB", validity: "30 Days" },
    ],
    corporate: [
      { id: "9m-corp-10gb", label: "10GB", amount: 3800, size: "10GB", validity: "30 Days" },
      { id: "9m-corp-15gb", label: "15GB", amount: 5500, size: "15GB", validity: "30 Days", popular: true },
    ],
  },
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function BuyDataPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("data");
  const [network, setNetwork] = useState<NetworkKey>("mtn");
  const [planType, setPlanType] = useState<PlanTypeKey>("sme");
  const [dataPlanId, setDataPlanId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [bypassPhone, setBypassPhone] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const plans = useMemo(() => DEMO_PLANS[network][planType] ?? [], [network, planType]);
  const selectedPlan = useMemo(() => plans.find((p) => p.id === dataPlanId) || null, [plans, dataPlanId]);

  useEffect(() => {
    if (plans.length > 0 && !plans.find(p => p.id === dataPlanId)) {
      setDataPlanId(plans[0].id);
    }
  }, [network, planType, plans, dataPlanId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!phoneNumber && !bypassPhone) {
      e.phoneNumber = "Phone number is required";
    } else if (!bypassPhone && !/^\d{11}$/.test(phoneNumber.replace(/\s+/g, ""))) {
      e.phoneNumber = "Enter a valid 11-digit phone number";
    }
    if (!pin) e.pin = "Transaction PIN is required";
    else if (!/^\d{4,6}$/.test(pin)) e.pin = "PIN should be 4-6 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Data purchase successful! ${selectedPlan?.size} for ${phoneNumber}`);
      setSubmitting(false);
      setPin("");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col lg:pl-64">
        {/* HEADER */}
        <Header setSidebarOpen={setSidebarOpen} />

        {/* CONTENT */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">Buy Data</span>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wifi className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buy Data</h1>
                <p className="text-gray-600 mt-1">Purchase mobile data bundles instantly with secure transactions</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Network Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Network</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {NETWORKS.map((n) => (
                    <button
                      key={n.key}
                      onClick={() => setNetwork(n.key)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        network === n.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full ${n.color} flex items-center justify-center mb-2`}>
                        <span className="text-white font-bold">{n.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-900">{n.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Plan Type Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Plan Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {PLAN_TYPES.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setPlanType(p.key)}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        planType === p.key
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${
                          planType === p.key ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {p.icon}
                        </div>
                        <span className="font-semibold text-gray-900">{p.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Plans */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
                  <span className="text-sm text-gray-500">{plans.length} plans</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {plans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => setDataPlanId(plan.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                        dataPlanId === plan.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{plan.size}</h3>
                          <p className="text-sm text-gray-500">{plan.validity}</p>
                        </div>
                        {plan.popular && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <div className="text-2xl font-bold text-gray-900">{formatNaira(plan.amount)}</div>
                        <p className="text-sm text-gray-500 mt-1">Per subscription</p>
                      </div>
                      {dataPlanId === plan.id && (
                        <div className="mt-3 flex items-center gap-1 text-blue-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact & Payment */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact & Payment</h2>
                <div className="space-y-5">
                  {/* Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                      {!bypassPhone && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      errors.phoneNumber ? "border-red-300" : "border-gray-300 focus-within:border-blue-500"
                    }`}>
                      <Phone className="h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        disabled={bypassPhone}
                        placeholder="0801 234 5678"
                        className="flex-1 bg-transparent outline-none text-gray-900 disabled:opacity-50"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="bypassPhone"
                          checked={bypassPhone}
                          onChange={(e) => setBypassPhone(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="bypassPhone" className="text-sm text-gray-600">
                          Bypass
                        </label>
                      </div>
                    </div>
                    {errors.phoneNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.phoneNumber}</p>
                    )}
                    {bypassPhone && (
                      <p className="mt-2 text-sm text-amber-600">Phone number will be requested later</p>
                    )}
                  </div>

                  {/* Transaction PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction PIN <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative rounded-xl border px-4 py-3 transition-colors ${
                      errors.pin ? "border-red-300" : "border-gray-300 focus-within:border-blue-500"
                    }`}>
                      <CreditCard className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="Enter your 4-6 digit PIN"
                        className="w-full bg-transparent pl-9 outline-none text-gray-900"
                        maxLength={6}
                      />
                    </div>
                    {errors.pin && <p className="mt-2 text-sm text-red-600">{errors.pin}</p>}
                    <p className="mt-2 text-sm text-gray-500">
                      Your PIN is securely encrypted and never stored in plain text
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedPlan}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Purchase...
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        Buy Data Now
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 space-y-6">
                {/* Order Summary */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Network</span>
                      <span className="font-semibold">{NETWORKS.find(n => n.key === network)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Plan Type</span>
                      <span className="font-semibold">{PLAN_TYPES.find(p => p.key === planType)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Data Bundle</span>
                      <span className="font-semibold">{selectedPlan?.size || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Validity</span>
                      <span className="font-semibold">{selectedPlan?.validity || "-"}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-300">Total Amount</span>
                        <span className="font-bold text-xl">
                          {selectedPlan ? formatNaira(selectedPlan.amount) : "₦0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPlan && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Shield className="h-4 w-4" />
                        <span>Secure Transaction</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your payment is protected with bank-level encryption. Funds are only deducted after successful delivery.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Avg. Delivery Time</span>
                      <span className="font-semibold text-gray-900">Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="font-semibold text-green-600">99.8%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Customer Support</span>
                      <span className="font-semibold text-gray-900">24/7</span>
                    </div>
                  </div>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Our support team is available 24/7 to assist with your data purchases.
                  </p>
                  <button className="w-full py-2.5 px-4 bg-white text-blue-600 font-medium rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}