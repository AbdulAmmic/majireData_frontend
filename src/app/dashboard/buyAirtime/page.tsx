"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { 
  ChevronRight, 
  Loader2, 
  Phone, 
  Shield, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  BadgeCheck,
  Sparkles,
  Zap,
  CheckCircle,
  Receipt,
  BatteryCharging,
  Gift,
  Wallet,
  Users,
  Smartphone,
  Clock,
  AlertCircle
} from "lucide-react";

type NetworkKey = "mtn" | "airtel" | "glo" | "9mobile";
type AirtimeTypeKey = "regular" | "share" | "bonus";

type AirtimePlan = {
  id: string;
  label: string;
  amount: number;
  actualValue: number;
  bonus?: string;
  popular?: boolean;
};

const NETWORKS: { key: NetworkKey; name: string; color: string }[] = [
  { key: "mtn", name: "MTN", color: "bg-yellow-500" },
  { key: "airtel", name: "Airtel", color: "bg-red-500" },
  { key: "glo", name: "Glo", color: "bg-green-500" },
  { key: "9mobile", name: "9mobile", color: "bg-teal-500" },
];

const AIRTIME_TYPES: { key: AirtimeTypeKey; name: string; description: string; icon: React.ReactNode }[] = [
  { 
    key: "regular", 
    name: "Regular", 
    description: "Direct airtime recharge",
    icon: <Smartphone className="h-4 w-4" />
  },
  { 
    key: "share", 
    name: "Share & Gift", 
    description: "Send airtime to others",
    icon: <Gift className="h-4 w-4" />
  },
  { 
    key: "bonus", 
    name: "Bonus Plans", 
    description: "Get extra value on recharge",
    icon: <BatteryCharging className="h-4 w-4" />
  },
];

const PRESET_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

const DEMO_BONUS_PLANS: Record<NetworkKey, AirtimePlan[]> = {
  mtn: [
    { id: "mtn-bonus-100", label: "₦100 + Bonus", amount: 100, actualValue: 110, bonus: "10% Extra", popular: true },
    { id: "mtn-bonus-500", label: "₦500 + Bonus", amount: 500, actualValue: 550, bonus: "10% Extra" },
    { id: "mtn-bonus-1000", label: "₦1000 + Bonus", amount: 1000, actualValue: 1150, bonus: "15% Extra", popular: true },
    { id: "mtn-bonus-5000", label: "₦5000 + Bonus", amount: 5000, actualValue: 6000, bonus: "20% Extra" },
  ],
  airtel: [
    { id: "airtel-bonus-100", label: "₦100 + Bonus", amount: 100, actualValue: 105, bonus: "5% Extra" },
    { id: "airtel-bonus-500", label: "₦500 + Bonus", amount: 500, actualValue: 525, bonus: "5% Extra" },
    { id: "airtel-bonus-1000", label: "₦1000 + Bonus", amount: 1000, actualValue: 1100, bonus: "10% Extra", popular: true },
    { id: "airtel-bonus-5000", label: "₦5000 + Bonus", amount: 5000, actualValue: 5500, bonus: "10% Extra" },
  ],
  glo: [
    { id: "glo-bonus-100", label: "₦100 + Bonus", amount: 100, actualValue: 120, bonus: "20% Extra", popular: true },
    { id: "glo-bonus-500", label: "₦500 + Bonus", amount: 500, actualValue: 600, bonus: "20% Extra" },
    { id: "glo-bonus-1000", label: "₦1000 + Bonus", amount: 1000, actualValue: 1250, bonus: "25% Extra", popular: true },
    { id: "glo-bonus-5000", label: "₦5000 + Bonus", amount: 5000, actualValue: 6500, bonus: "30% Extra" },
  ],
  "9mobile": [
    { id: "9m-bonus-100", label: "₦100 + Bonus", amount: 100, actualValue: 115, bonus: "15% Extra" },
    { id: "9m-bonus-500", label: "₦500 + Bonus", amount: 500, actualValue: 575, bonus: "15% Extra", popular: true },
    { id: "9m-bonus-1000", label: "₦1000 + Bonus", amount: 1000, actualValue: 1200, bonus: "20% Extra" },
    { id: "9m-bonus-5000", label: "₦5000 + Bonus", amount: 5000, actualValue: 6250, bonus: "25% Extra", popular: true },
  ],
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function BuyAirtimePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("airtime");
  const [network, setNetwork] = useState<NetworkKey>("mtn");
  const [airtimeType, setAirtimeType] = useState<AirtimeTypeKey>("regular");
  const [amount, setAmount] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [recipientPhone, setRecipientPhone] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [bypassPhone, setBypassPhone] = useState<boolean>(false);
  const [customAmount, setCustomAmount] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const bonusPlans = useMemo(() => DEMO_BONUS_PLANS[network] || [], [network]);
  const selectedBonusPlan = useMemo(() => 
    bonusPlans.find((p) => p.amount === Number(amount)) || null, 
    [bonusPlans, amount]
  );

  const handlePresetSelect = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setCustomAmount(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!amount || Number(amount) <= 0) {
      e.amount = "Please enter a valid amount";
    } else if (Number(amount) < 50) {
      e.amount = "Minimum recharge amount is ₦50";
    } else if (Number(amount) > 50000) {
      e.amount = "Maximum recharge amount is ₦50,000";
    }

    if (!phoneNumber && !bypassPhone) {
      e.phoneNumber = "Phone number is required";
    } else if (!bypassPhone && !/^\d{11}$/.test(phoneNumber.replace(/\s+/g, ""))) {
      e.phoneNumber = "Enter a valid 11-digit phone number";
    }

    if (airtimeType === "share" && !recipientPhone) {
      e.recipientPhone = "Recipient phone number is required";
    } else if (airtimeType === "share" && !/^\d{11}$/.test(recipientPhone.replace(/\s+/g, ""))) {
      e.recipientPhone = "Enter a valid 11-digit recipient number";
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
      const message = airtimeType === "share" 
        ? `Successfully sent ${formatNaira(Number(amount))} airtime to ${recipientPhone}`
        : `Successfully recharged ${formatNaira(Number(amount))} to ${phoneNumber}`;
      
      alert(message);
      setSubmitting(false);
      setPin("");
      if (airtimeType === "share") {
        setRecipientPhone("");
      }
    }, 1500);
  };

  const getActualValue = () => {
    if (airtimeType === "bonus" && selectedBonusPlan) {
      return selectedBonusPlan.actualValue;
    }
    return Number(amount);
  };

  const getBonusInfo = () => {
    if (airtimeType === "bonus" && selectedBonusPlan) {
      return {
        bonus: selectedBonusPlan.bonus,
        extra: selectedBonusPlan.actualValue - selectedBonusPlan.amount
      };
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50/30">
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
            <Link href="/dashboard" className="hover:text-purple-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">Buy Airtime</span>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Buy Airtime</h1>
                <p className="text-gray-600 mt-1">Recharge instantly with bonus offers and sharing options</p>
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
                          ? "border-purple-500 bg-purple-50"
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

              {/* Airtime Type Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Airtime Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {AIRTIME_TYPES.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setAirtimeType(type.key)}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        airtimeType === type.key
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${
                          airtimeType === type.key ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          {type.icon}
                        </div>
                        <span className="font-semibold text-gray-900">{type.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Select Amount</h2>
                  {airtimeType === "bonus" && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                      Bonus Offers Available
                    </span>
                  )}
                </div>

                {airtimeType === "bonus" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {bonusPlans.map((plan) => (
                        <button
                          key={plan.id}
                          onClick={() => handlePresetSelect(plan.amount)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                            amount === plan.amount.toString()
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-purple-300"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-bold text-gray-900 text-lg">{formatNaira(plan.amount)}</div>
                            <div className="mt-1 text-sm text-gray-600">Get {formatNaira(plan.actualValue)}</div>
                            {plan.popular && (
                              <div className="mt-2">
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                  {plan.bonus}
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Or enter custom amount (₦50 - ₦50,000)</p>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
                        <input
                          type="number"
                          value={customAmount ? amount : ""}
                          onChange={(e) => {
                            setAmount(e.target.value);
                            setCustomAmount(true);
                          }}
                          placeholder="Enter custom amount"
                          min="50"
                          max="50000"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                            errors.amount ? "border-red-300" : "border-gray-300"
                          } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                      {PRESET_AMOUNTS.map((preset) => (
                        <button
                          key={preset}
                          onClick={() => handlePresetSelect(preset)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            amount === preset.toString() && !customAmount
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="font-bold text-gray-900">{formatNaira(preset)}</div>
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₦</span>
                      <input
                        type="number"
                        value={customAmount ? amount : ""}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setCustomAmount(true);
                        }}
                        placeholder="Enter custom amount (₦50 - ₦50,000)"
                        min="50"
                        max="50000"
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          errors.amount ? "border-red-300" : "border-gray-300"
                        } focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                    )}
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-5">
                  {/* Your Phone Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Phone Number
                      {!bypassPhone && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      errors.phoneNumber ? "border-red-300" : "border-gray-300 focus-within:border-purple-500"
                    }`}>
                      <Smartphone className="h-5 w-5 text-gray-400" />
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
                          className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
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

                  {/* Recipient Phone Number (for sharing) */}
                  {airtimeType === "share" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Recipient's Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                        errors.recipientPhone ? "border-red-300" : "border-gray-300 focus-within:border-purple-500"
                      }`}>
                        <Users className="h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={recipientPhone}
                          onChange={(e) => setRecipientPhone(e.target.value)}
                          placeholder="0809 876 5432"
                          className="flex-1 bg-transparent outline-none text-gray-900"
                        />
                      </div>
                      {errors.recipientPhone && (
                        <p className="mt-2 text-sm text-red-600">{errors.recipientPhone}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Enter the phone number you want to send airtime to
                      </p>
                    </div>
                  )}

                  {/* Transaction PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction PIN <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative rounded-xl border px-4 py-3 transition-colors ${
                      errors.pin ? "border-red-300" : "border-gray-300 focus-within:border-purple-500"
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
                    disabled={submitting || !amount}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Recharge...
                      </>
                    ) : (
                      <>
                        <Phone className="h-5 w-5" />
                        {airtimeType === "share" ? "Send Airtime Now" : "Recharge Now"}
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
                    <Receipt className="h-5 w-5" />
                    Order Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Network</span>
                      <span className="font-semibold">{NETWORKS.find(n => n.key === network)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Airtime Type</span>
                      <span className="font-semibold">{AIRTIME_TYPES.find(t => t.key === airtimeType)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Amount</span>
                      <span className="font-semibold">{amount ? formatNaira(Number(amount)) : "-"}</span>
                    </div>
                    
                    {/* Bonus Information */}
                    {getBonusInfo() && (
                      <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300">Bonus</span>
                          <span className="font-semibold text-green-400">{getBonusInfo()?.bonus}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Extra Value</span>
                          <span className="font-semibold text-green-400">+{formatNaira(getBonusInfo()?.extra || 0)}</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-300">Total Value</span>
                        <span className="font-bold text-xl">
                          {amount ? formatNaira(getActualValue()) : "₦0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {amount && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Shield className="h-4 w-4" />
                        <span>Instant Delivery</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your airtime will be delivered within seconds. Failed transactions are automatically refunded.
                      </p>
                    </div>
                  )}
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Delivery Time</span>
                      </div>
                      <span className="font-semibold text-gray-900">Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Success Rate</span>
                      </div>
                      <span className="font-semibold text-green-600">99.9%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Min. Amount</span>
                      </div>
                      <span className="font-semibold text-gray-900">₦50</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Max. Amount</span>
                      </div>
                      <span className="font-semibold text-gray-900">₦50,000</span>
                    </div>
                  </div>
                </div>

                {/* Network Benefits */}
                <div className="bg-purple-50 rounded-2xl border border-purple-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Network Benefits</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Instant recharge confirmation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Carry-over balance for most plans</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>24/7 customer support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                      <span>Bonus offers on select amounts</span>
                    </li>
                  </ul>
                </div>

                {/* Support Section */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Assistance?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Having issues with your recharge? Our support team is here to help.
                  </p>
                  <button className="w-full py-2.5 px-4 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors">
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