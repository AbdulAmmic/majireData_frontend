"use client";

import { API_BASE_URL } from "@/config";

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

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

import MessageModal from "@/components/messageModal";

export default function BuyDataPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("data");

  // Custom Modal State
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

  const [network, setNetwork] = useState<NetworkKey>("mtn");
  const [planType, setPlanType] = useState<PlanTypeKey>("sme");
  const [dataPlanId, setDataPlanId] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [bypassPhone, setBypassPhone] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // State for plans fetched from backend
  const [fetchedPlans, setFetchedPlans] = useState<DataPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);

  // Simplified since we now fetch specific plans per network & type
  const plans = fetchedPlans;

  const selectedPlan = useMemo(() => plans.find((p) => p.id === dataPlanId) || null, [plans, dataPlanId]);

  useEffect(() => {
    async function fetchPlans() {
      setLoadingPlans(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        let networkKey = `${network}_${planType}_data`;
        if (planType === "corporate") networkKey = `${network}_corporate_data`;

        const res = await fetch(`${API_BASE_URL}/peyflex/data/plans/?network=${networkKey}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const body = await res.json();
        if (res.ok) {
          const items = Array.isArray(body) ? body : (body.data || []);
          const mapped: DataPlan[] = items.map((item: any) => ({
            id: item.plan_id || item.id || item.plan_code || item.name,
            label: item.name || item.plan_name || item.size || "Data Plan",
            amount: item.amount || item.price || 0,
            size: item.size || item.allowance || item.name || "Data Plan",
            validity: item.validity || "30 Days",
            popular: false
          }));
          const refined = mapped.map(p => {
            const match = p.label.match(/(\d+\.?\d*)(MB|GB|TB)/i);
            if (match) {
              p.size = match[0].toUpperCase();
            }
            return p;
          });
          setFetchedPlans(refined);
        } else {
          setFetchedPlans([]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingPlans(false);
      }
    }
    fetchPlans();
  }, [network, planType]);


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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to purchase data.");
        window.location.href = "/";
        return;
      }

      // Format network correctly for backend e.g mtn_sme_data
      let networkKey = `${network}_${planType}_data`;
      if (planType === "corporate") networkKey = `${network}_corporate_data`;

      const payload = {
        network: networkKey,
        plan_code: selectedPlan?.id || "",
        mobile_number: phoneNumber,
        transaction_pin: pin
      };

      const res = await fetch(`${API_BASE_URL}/peyflex/data/purchase/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Data purchase failed");
      }

      showMessage(
        "Purchase Successful",
        `You have successfully purchased ${selectedPlan?.size} data for ${phoneNumber}. Reference: ${data.data.purchase_id}`,
        "success"
      );

      setPin("");

    } catch (error: any) {
      showMessage("Purchase Failed", error.message || "An error occurred while processing your request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <MessageModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
      {/* SIDEBAR */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeView={activeView} setActiveView={setActiveView} />

      {/* OVERLAY FOR MOBILE */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
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
                <div className="relative">
                  <select
                    value={network}
                    onChange={(e) => setNetwork(e.target.value as NetworkKey)}
                    className="w-full p-4 pl-12 rounded-xl border border-gray-200 bg-gray-50/50 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium cursor-pointer"
                  >
                    {NETWORKS.map((n) => (
                      <option key={n.key} value={n.key}>
                        {n.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className={`h-6 w-6 rounded-full ${NETWORKS.find(n => n.key === network)?.color} flex items-center justify-center`}>
                      <span className="text-white text-xs font-bold">{NETWORKS.find(n => n.key === network)?.name.charAt(0)}</span>
                    </div>
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none h-5 w-5" />
                </div>
              </div>

              {/* Plan Type Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Plan Type</h2>
                <div className="relative">
                  <select
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as PlanTypeKey)}
                    className="w-full p-4 pl-12 rounded-xl border border-gray-200 bg-gray-50/50 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium cursor-pointer"
                  >
                    {PLAN_TYPES.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name} - {p.description}
                      </option>
                    ))}
                  </select>
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none">
                    {PLAN_TYPES.find(p => p.key === planType)?.icon}
                  </div>
                  <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none h-5 w-5" />
                </div>
              </div>

              {/* Data Plans */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Available Plans</h2>
                  <span className="text-sm text-gray-500">{plans.length} plans</span>
                </div>

                <div className="relative">
                  <select
                    value={dataPlanId}
                    onChange={(e) => setDataPlanId(e.target.value)}
                    className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50/50 appearance-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 font-medium cursor-pointer"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.size} - {formatNaira(plan.amount)} ({plan.validity})
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none h-5 w-5" />
                </div>

                {/* Selected Plan Summary (Optional visual confirmation) */}
                {selectedPlan && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Selected Plan</p>
                        <p className="text-lg font-bold text-gray-900">{selectedPlan.size}</p>
                        <p className="text-sm text-gray-600">{selectedPlan.validity}</p>
                      </div>
                      <div className="text-xl font-bold text-blue-700">
                        {formatNaira(selectedPlan.amount)}
                      </div>
                    </div>
                  </div>
                )}
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
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${errors.phoneNumber ? "border-red-300" : "border-gray-300 focus-within:border-blue-500"
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
                    <div className={`relative rounded-xl border px-4 py-3 transition-colors ${errors.pin ? "border-red-300" : "border-gray-300 focus-within:border-blue-500"
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