"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { 
  ChevronRight, 
  Loader2, 
  Tv, 
  Shield, 
  CreditCard,
  ArrowRight,
  TrendingUp,
  BadgeCheck,
  Sparkles,
  CheckCircle,
  Receipt,
  Calendar,
  Users,
  Film,
  Music,
  Globe,
  Clock,
  AlertCircle,
  Zap,
  Star,
  Gift
} from "lucide-react";

type ProviderKey = "dstv" | "gotv" | "startimes" | "showmax";
type PackageTypeKey = "compact" | "premium" | "basic" | "bouquet";

type CablePackage = {
  id: string;
  name: string;
  amount: number;
  duration: string;
  description: string;
  channels: number;
  popular?: boolean;
  features: string[];
};

const PROVIDERS: { key: ProviderKey; name: string; color: string; icon: React.ReactNode }[] = [
  { 
    key: "dstv", 
    name: "DStv", 
    color: "bg-red-500",
    icon: <Tv className="h-5 w-5" />
  },
  { 
    key: "gotv", 
    name: "GOtv", 
    color: "bg-blue-500",
    icon: <Tv className="h-5 w-5" />
  },
  { 
    key: "startimes", 
    name: "StarTimes", 
    color: "bg-orange-500",
    icon: <Tv className="h-5 w-5" />
  },
  { 
    key: "showmax", 
    name: "Showmax", 
    color: "bg-purple-500",
    icon: <Film className="h-5 w-5" />
  },
];

const PACKAGE_TYPES: Record<ProviderKey, { key: PackageTypeKey; name: string; description: string }[]> = {
  dstv: [
    { key: "compact", name: "Compact", description: "Popular channels for family viewing" },
    { key: "premium", name: "Premium", description: "Full package with all channels" },
    { key: "bouquet", name: "Bouquets", description: "Custom channel combinations" },
  ],
  gotv: [
    { key: "basic", name: "Basic", description: "Essential entertainment channels" },
    { key: "compact", name: "Compact", description: "Popular local & international channels" },
    { key: "premium", name: "Premium", description: "Complete entertainment package" },
  ],
  startimes: [
    { key: "basic", name: "Basic", description: "Essential digital channels" },
    { key: "compact", name: "Compact", description: "Popular sports & movies" },
    { key: "premium", name: "Premium", description: "Complete package with all channels" },
  ],
  showmax: [
    { key: "basic", name: "Basic", description: "Standard streaming plan" },
    { key: "premium", name: "Premium", description: "Premium streaming with downloads" },
    { key: "bouquet", name: "Bundles", description: "Combined packages" },
  ],
};

const DURATION_OPTIONS = [
  { label: "1 Month", value: "1" },
  { label: "2 Months", value: "2" },
  { label: "3 Months", value: "3" },
  { label: "6 Months", value: "6" },
  { label: "1 Year", value: "12" },
];

const DEMO_PACKAGES: Record<ProviderKey, Record<PackageTypeKey, CablePackage[]>> = {
  dstv: {
      compact: [
          {
              id: "dstv-compact-monthly",
              name: "DStv Compact",
              amount: 12500,
              duration: "1 Month",
              description: "Popular entertainment package",
              channels: 100,
              popular: true,
              features: ["SuperSport Select", "M-Net", "Discovery", "Nat Geo"]
          },
          {
              id: "dstv-compact-quarterly",
              name: "DStv Compact",
              amount: 35000,
              duration: "3 Months",
              description: "Save ₦2,500 with quarterly plan",
              channels: 100,
              features: ["SuperSport Select", "M-Net", "Discovery", "Nat Geo"]
          },
      ],
      premium: [
          {
              id: "dstv-premium-monthly",
              name: "DStv Premium",
              amount: 21000,
              duration: "1 Month",
              description: "Complete package with all channels",
              channels: 180,
              features: ["All SuperSport", "All M-Net", "BoxOffice", "Explora"]
          },
          {
              id: "dstv-premium-annual",
              name: "DStv Premium",
              amount: 220000,
              duration: "1 Year",
              description: "Best value - Save ₦32,000",
              channels: 180,
              popular: true,
              features: ["All SuperSport", "All M-Net", "BoxOffice", "Explora"]
          },
      ],
      bouquet: [
          {
              id: "dstv-confam",
              name: "DStv Confam",
              amount: 6300,
              duration: "1 Month",
              description: "Family entertainment",
              channels: 65,
              features: ["Select SuperSport", "Family Movies", "Kids Channels"]
          },
          {
              id: "dstv-yanga",
              name: "DStv Yanga",
              amount: 4100,
              duration: "1 Month",
              description: "Budget-friendly option",
              channels: 45,
              features: ["Local Channels", "Select Sports", "Entertainment"]
          },
      ],
      basic: []
  },
  gotv: {
      basic: [
          {
              id: "gotv-jinja",
              name: "GOtv Jinja",
              amount: 2200,
              duration: "1 Month",
              description: "Essential digital entertainment",
              channels: 40,
              features: ["Local Channels", "News", "Entertainment"]
          },
          {
              id: "gotv-jinja-quarterly",
              name: "GOtv Jinja",
              amount: 6000,
              duration: "3 Months",
              description: "Save ₦600 quarterly",
              channels: 40,
              features: ["Local Channels", "News", "Entertainment"]
          },
      ],
      compact: [
          {
              id: "gotv-max",
              name: "GOtv Max",
              amount: 4150,
              duration: "1 Month",
              description: "Popular package with sports",
              channels: 70,
              popular: true,
              features: ["SuperSport Select", "M-Net", "Novela", "Kids"]
          },
          {
              id: "gotv-max-annual",
              name: "GOtv Max",
              amount: 41500,
              duration: "1 Year",
              description: "Get 1 month free",
              channels: 70,
              features: ["SuperSport Select", "M-Net", "Novela", "Kids"]
          },
      ],
      premium: [
          {
              id: "gotv-supa",
              name: "GOtv Supa",
              amount: 5900,
              duration: "1 Month",
              description: "Complete entertainment",
              channels: 90,
              features: ["All SuperSport", "M-Net Movies", "BoxOffice", "Explora"]
          },
      ],
      bouquet: []
  },
  startimes: {
      basic: [
          {
              id: "startimes-nova",
              name: "Nova",
              amount: 1300,
              duration: "1 Month",
              description: "Basic digital package",
              channels: 30,
              features: ["Local Channels", "News", "Entertainment"]
          },
      ],
      compact: [
          {
              id: "startimes-basic",
              name: "Basic",
              amount: 2600,
              duration: "1 Month",
              description: "Popular sports & movies",
              channels: 60,
              popular: true,
              features: ["Sports", "Movies", "Series", "Documentaries"]
          },
          {
              id: "startimes-basic-annual",
              name: "Basic",
              amount: 26000,
              duration: "1 Year",
              description: "Annual subscription",
              channels: 60,
              features: ["Sports", "Movies", "Series", "Documentaries"]
          },
      ],
      premium: [
          {
              id: "startimes-classic",
              name: "Classic",
              amount: 4500,
              duration: "1 Month",
              description: "Complete package",
              channels: 100,
              features: ["All Sports", "Premium Movies", "Kids", "Documentaries"]
          },
          {
              id: "startimes-smart",
              name: "Smart",
              amount: 7200,
              duration: "1 Month",
              description: "Premium with extra channels",
              channels: 120,
              features: ["All Sports", "Premium Movies", "Chinese Channels", "Kids"]
          },
      ],
      bouquet: []
  },
  showmax: {
      basic: [
          {
              id: "showmax-mobile",
              name: "Showmax Mobile",
              amount: 1200,
              duration: "1 Month",
              description: "Stream on 1 mobile device",
              channels: 0,
              features: ["Mobile Only", "Local & Int'l Content", "Download Option"]
          },
      ],
      premium: [
          {
              id: "showmax-premium",
              name: "Showmax Premium",
              amount: 2900,
              duration: "1 Month",
              description: "Stream on 2 devices",
              channels: 0,
              popular: true,
              features: ["2 Devices", "HD Streaming", "Downloads", "Live Sports"]
          },
          {
              id: "showmax-premium-annual",
              name: "Showmax Premium",
              amount: 29000,
              duration: "1 Year",
              description: "Save ₦5,800 annually",
              channels: 0,
              features: ["2 Devices", "HD Streaming", "Downloads", "Live Sports"]
          },
      ],
      bouquet: [
          {
              id: "showmax-pro",
              name: "Showmax Pro",
              amount: 4400,
              duration: "1 Month",
              description: "Includes live TV channels",
              channels: 20,
              features: ["Live TV", "Premier League", "2 Devices", "Downloads"]
          },
      ],
      compact: []
  },
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function CableSubscriptionPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("cable");
  const [provider, setProvider] = useState<ProviderKey>("dstv");
  const [packageType, setPackageType] = useState<PackageTypeKey>("compact");
  const [selectedPackageId, setSelectedPackageId] = useState<string>("");
  const [duration, setDuration] = useState<string>("1");
  const [smartCardNumber, setSmartCardNumber] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const availablePackages = useMemo(() => 
    DEMO_PACKAGES[provider]?.[packageType] || [], 
    [provider, packageType]
  );

  const selectedPackage = useMemo(() => 
    availablePackages.find((p) => p.id === selectedPackageId) || null, 
    [availablePackages, selectedPackageId]
  );

  const packageTypes = useMemo(() => 
    PACKAGE_TYPES[provider] || [], 
    [provider]
  );

  useEffect(() => {
    if (availablePackages.length > 0 && !availablePackages.find(p => p.id === selectedPackageId)) {
      setSelectedPackageId(availablePackages[0].id);
    }
  }, [provider, packageType, availablePackages, selectedPackageId]);

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!smartCardNumber) {
      e.smartCardNumber = "Smart card/IUC number is required";
    } else if (!/^\d{10,14}$/.test(smartCardNumber.replace(/\s+/g, ""))) {
      e.smartCardNumber = "Enter a valid 10-14 digit number";
    }

    if (!customerName) {
      e.customerName = "Customer name is required";
    }

    if (!customerPhone) {
      e.customerPhone = "Customer phone number is required";
    } else if (!/^\d{11}$/.test(customerPhone.replace(/\s+/g, ""))) {
      e.customerPhone = "Enter a valid 11-digit phone number";
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
      alert(`Cable subscription successful! ${selectedPackage?.name} activated for ${smartCardNumber}`);
      setSubmitting(false);
      setPin("");
    }, 1500);
  };

  const calculateTotalAmount = () => {
    if (!selectedPackage) return 0;
    const months = parseInt(duration);
    const monthlyAmount = selectedPackage.amount;
    // Apply discounts for longer durations
    switch (months) {
      case 3: return Math.floor(monthlyAmount * months * 0.95); // 5% discount
      case 6: return Math.floor(monthlyAmount * months * 0.90); // 10% discount
      case 12: return Math.floor(monthlyAmount * months * 0.85); // 15% discount
      default: return monthlyAmount * months;
    }
  };

  const getSavings = () => {
    if (!selectedPackage) return 0;
    const months = parseInt(duration);
    const monthlyAmount = selectedPackage.amount;
    const regularTotal = monthlyAmount * months;
    const discountedTotal = calculateTotalAmount();
    return regularTotal - discountedTotal;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
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
            <Link href="/dashboard" className="hover:text-amber-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">Cable Subscription</span>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Tv className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Cable TV Subscription</h1>
                <p className="text-gray-600 mt-1">Renew or subscribe to your favorite TV packages instantly</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Provider Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Provider</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setProvider(p.key)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        provider === p.key
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`h-10 w-10 rounded-full ${p.color} flex items-center justify-center mb-2 text-white`}>
                        {p.icon}
                      </div>
                      <span className="font-medium text-gray-900">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Type Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Package Type</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {packageTypes.map((type) => (
                    <button
                      key={type.key}
                      onClick={() => setPackageType(type.key)}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                        packageType === type.key
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`p-2 rounded-lg ${
                          packageType === type.key ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-600"
                        }`}>
                          <Star className="h-4 w-4" />
                        </div>
                        <span className="font-semibold text-gray-900">{type.name}</span>
                      </div>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Package Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Available Packages</h2>
                  <span className="text-sm text-gray-500">{availablePackages.length} packages</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availablePackages.map((pkg) => (
                    <button
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      className={`p-5 rounded-xl border-2 transition-all duration-200 text-left hover:scale-[1.01] ${
                        selectedPackageId === pkg.id
                          ? "border-amber-500 bg-amber-50"
                          : "border-gray-200 hover:border-amber-300"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{pkg.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">{pkg.description}</p>
                        </div>
                        {pkg.popular && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{pkg.channels} Channels</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{pkg.duration}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatNaira(pkg.amount)}
                          <span className="text-sm font-normal text-gray-500"> / month</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-700">Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {pkg.features.slice(0, 3).map((feature, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              {feature}
                            </span>
                          ))}
                          {pkg.features.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                              +{pkg.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {selectedPackageId === pkg.id && (
                        <div className="mt-4 flex items-center gap-1 text-amber-600 text-sm">
                          <CheckCircle className="h-4 w-4" />
                          <span>Selected</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subscription Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
                <div className="space-y-5">
                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subscription Duration
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      {DURATION_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setDuration(option.value)}
                          className={`py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                            duration === option.value
                              ? "border-amber-500 bg-amber-50 text-amber-700 font-medium"
                              : "border-gray-200 hover:border-gray-300 text-gray-700"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Longer durations come with discounted rates
                    </p>
                  </div>

                  {/* Smart Card Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Smart Card / IUC Number <span className="text-red-500">*</span>
                    </label>
                    <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                      errors.smartCardNumber ? "border-red-300" : "border-gray-300 focus-within:border-amber-500"
                    }`}>
                      <CreditCard className="h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={smartCardNumber}
                        onChange={(e) => setSmartCardNumber(e.target.value)}
                        placeholder="Enter 10-14 digit smart card number"
                        className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                        inputMode="numeric"
                      />
                    </div>
                    {errors.smartCardNumber && (
                      <p className="mt-2 text-sm text-red-600">{errors.smartCardNumber}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      Find this number on your decoder or previous receipt
                    </p>
                  </div>

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
                          errors.customerName ? "border-red-300" : "border-gray-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                        }`}
                      />
                      {errors.customerName && (
                        <p className="mt-2 text-sm text-red-600">{errors.customerName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Customer Phone <span className="text-red-500">*</span>
                      </label>
                      <div className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        errors.customerPhone ? "border-red-300" : "border-gray-300 focus-within:border-amber-500"
                      }`}>
                        <Users className="h-5 w-5 text-gray-400" />
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="0801 234 5678"
                          className="flex-1 bg-transparent outline-none text-gray-900"
                        />
                      </div>
                      {errors.customerPhone && (
                        <p className="mt-2 text-sm text-red-600">{errors.customerPhone}</p>
                      )}
                    </div>
                  </div>

                  {/* Transaction PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction PIN <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative rounded-xl border px-4 py-3 transition-colors ${
                      errors.pin ? "border-red-300" : "border-gray-300 focus-within:border-amber-500"
                    }`}>
                      <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
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
                      Your PIN is securely encrypted for transaction authorization
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !selectedPackage}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Subscription...
                      </>
                    ) : (
                      <>
                        <Tv className="h-5 w-5" />
                        Subscribe Now
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
                      <span className="text-gray-300">Provider</span>
                      <span className="font-semibold">{PROVIDERS.find(p => p.key === provider)?.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Package</span>
                      <span className="font-semibold text-right">{selectedPackage?.name || "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Duration</span>
                      <span className="font-semibold">
                        {DURATION_OPTIONS.find(d => d.value === duration)?.label || "1 Month"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Monthly Rate</span>
                      <span className="font-semibold">
                        {selectedPackage ? formatNaira(selectedPackage.amount) : "-"}
                      </span>
                    </div>

                    {/* Discount/Savings */}
                    {getSavings() > 0 && (
                      <div className="bg-gray-800/50 rounded-lg p-3 mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-gray-300">Discount Applied</span>
                          <span className="font-semibold text-green-400">
                            -{formatNaira(getSavings())}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Gift className="h-3 w-3" />
                          <span>You saved {Math.round((getSavings() / (selectedPackage?.amount || 1 * parseInt(duration))) * 100)}%</span>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-300">Total Amount</span>
                        <span className="font-bold text-xl">
                          {selectedPackage ? formatNaira(calculateTotalAmount()) : "₦0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedPackage && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Zap className="h-4 w-4" />
                        <span>Instant Activation</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Your subscription will be activated immediately after payment. Keep your decoder on for updates.
                      </p>
                    </div>
                  )}
                </div>

                {/* Package Features */}
                {selectedPackage && (
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Package Features</h3>
                    <ul className="space-y-3">
                      {selectedPackage.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="p-1 bg-amber-100 rounded mt-0.5">
                            <CheckCircle className="h-3 w-3 text-amber-600" />
                          </div>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Globe className="h-4 w-4" />
                        <span>{selectedPackage.channels} channels included</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Activation Time</span>
                      </div>
                      <span className="font-semibold text-gray-900">5-15 mins</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Success Rate</span>
                      </div>
                      <span className="font-semibold text-green-600">99.7%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Support</span>
                      </div>
                      <span className="font-semibold text-gray-900">24/7</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Receipt</span>
                      </div>
                      <span className="font-semibold text-gray-900">Email/SMS</span>
                    </div>
                  </div>
                </div>

                {/* Support Section */}
                <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Having issues with activation? Contact our support for immediate assistance.
                  </p>
                  <button className="w-full py-2.5 px-4 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors">
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