"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "@/components/sidebar";
import Header from "@/components/header";
import Link from "next/link";
import { 
  ChevronRight, 
  Loader2, 
  Wallet, 
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
  Banknote,
  Building,
  Smartphone,
  Clock,
  AlertCircle,
  Zap,
  Star,
  Gift,
  BanknoteIcon,
  QrCode,
  Smartphone as PhoneIcon,
  Monitor,
  Lock,
  RefreshCw,
  History
} from "lucide-react";

type PaymentMethodKey = "card" | "bank" | "transfer" | "ussd" | "qr";
type BankKey = "gtb" | "zenith" | "uba" | "firstbank" | "access" | "fidelity";

type Bank = {
  key: BankKey;
  name: string;
  code: string;
  color: string;
};

type Transaction = {
  id: string;
  amount: number;
  method: string;
  date: string;
  status: "success" | "pending" | "failed";
};

const PAYMENT_METHODS: { key: PaymentMethodKey; name: string; description: string; icon: React.ReactNode }[] = [
  { 
    key: "card", 
    name: "Card Payment", 
    description: "Instant payment with debit/credit card",
    icon: <CreditCard className="h-5 w-5" />
  },
  { 
    key: "bank", 
    name: "Bank Deposit", 
    description: "Direct deposit to our bank account",
    icon: <Building className="h-5 w-5" />
  },
  { 
    key: "transfer", 
    name: "Bank Transfer", 
    description: "Transfer from your bank app/website",
    icon: <BanknoteIcon className="h-5 w-5" />
  },
  { 
    key: "ussd", 
    name: "USSD Code", 
    description: "Quick payment using *xyz#",
    icon: <PhoneIcon className="h-5 w-5" />
  },
  { 
    key: "qr", 
    name: "QR Payment", 
    description: "Scan QR code to pay",
    icon: <QrCode className="h-5 w-5" />
  },
];

const BANKS: Bank[] = [
  { key: "gtb", name: "Guaranty Trust Bank", code: "058", color: "bg-orange-500" },
  { key: "zenith", name: "Zenith Bank", code: "057", color: "bg-blue-500" },
  { key: "uba", name: "United Bank for Africa", code: "033", color: "bg-red-500" },
  { key: "firstbank", name: "First Bank", code: "011", color: "bg-green-500" },
  { key: "access", name: "Access Bank", code: "044", color: "bg-purple-500" },
  { key: "fidelity", name: "Fidelity Bank", code: "070", color: "bg-teal-500" },
];

const PRESET_AMOUNTS = [1000, 2000, 5000, 10000, 20000, 50000];

const DEMO_TRANSACTIONS: Transaction[] = [
  { id: "1", amount: 5000, method: "Card", date: "Today, 10:30 AM", status: "success" },
  { id: "2", amount: 15000, method: "Bank Transfer", date: "Yesterday, 3:45 PM", status: "success" },
  { id: "3", amount: 2000, method: "USSD", date: "Dec 15, 9:15 AM", status: "success" },
  { id: "4", amount: 10000, method: "Bank Deposit", date: "Dec 14, 2:30 PM", status: "pending" },
  { id: "5", amount: 5000, method: "QR", date: "Dec 13, 11:00 AM", status: "success" },
];

const USSD_CODES: Record<string, string> = {
  "gtb": "*737*50*Amount*123456#",
  "zenith": "*966*Amount*123456#",
  "uba": "*919*Amount*123456#",
  "firstbank": "*894*Amount*123456#",
  "access": "*901*Amount*123456#",
  "fidelity": "*770*Amount*123456#",
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function FundWalletPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState("wallet");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodKey>("card");
  const [amount, setAmount] = useState<string>("");
  const [selectedBank, setSelectedBank] = useState<BankKey>("gtb");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountName, setAccountName] = useState<string>("");
  const [cardNumber, setCardNumber] = useState<string>("");
  const [cardExpiry, setCardExpiry] = useState<string>("");
  const [cardCVV, setCardCVV] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [customAmount, setCustomAmount] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [walletBalance, setWalletBalance] = useState<number>(24500);
  const [showAccountDetails, setShowAccountDetails] = useState<boolean>(false);

  const selectedBankDetails = useMemo(() => 
    BANKS.find(b => b.key === selectedBank) || BANKS[0], 
    [selectedBank]
  );

  const handlePresetSelect = (presetAmount: number) => {
    setAmount(presetAmount.toString());
    setCustomAmount(false);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!amount || Number(amount) <= 0) {
      e.amount = "Please enter a valid amount";
    } else if (Number(amount) < 100) {
      e.amount = "Minimum funding amount is ₦100";
    } else if (Number(amount) > 1000000) {
      e.amount = "Maximum funding amount is ₦1,000,000";
    }

    if (paymentMethod === "card") {
      if (!cardNumber) e.cardNumber = "Card number is required";
      else if (!/^\d{16}$/.test(cardNumber.replace(/\s+/g, ""))) {
        e.cardNumber = "Enter a valid 16-digit card number";
      }
      if (!cardExpiry) e.cardExpiry = "Expiry date is required";
      else if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        e.cardExpiry = "Format: MM/YY";
      }
      if (!cardCVV) e.cardCVV = "CVV is required";
      else if (!/^\d{3,4}$/.test(cardCVV)) {
        e.cardCVV = "Enter a valid CVV (3-4 digits)";
      }
    }

    if (paymentMethod === "bank" || paymentMethod === "transfer") {
      if (!accountNumber) e.accountNumber = "Account number is required";
      else if (!/^\d{10}$/.test(accountNumber.replace(/\s+/g, ""))) {
        e.accountNumber = "Enter a valid 10-digit account number";
      }
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
      const newBalance = walletBalance + Number(amount);
      setWalletBalance(newBalance);
      alert(`Successfully funded wallet with ${formatNaira(Number(amount))}`);
      setSubmitting(false);
      setAmount("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVV("");
      setAccountNumber("");
      setPin("");
    }, 1500);
  };

  const generateAccountDetails = () => {
    const bank = BANKS.find(b => b.key === selectedBank);
    return {
      bankName: bank?.name || "",
      accountNumber: "1023456789",
      accountName: "TRUSTPAY SERVICES LTD",
      reference: `TRUST-${Date.now().toString().slice(-8)}`
    };
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
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
            <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-700 font-medium">Fund Wallet</span>
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Wallet className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Fund Your Wallet</h1>
                <p className="text-gray-600 mt-1">Add money to your wallet instantly using multiple payment methods</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Wallet Balance */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold mb-1">Current Balance</h2>
                    <p className="text-emerald-100 text-sm">Available for transactions</p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-emerald-200" />
                </div>
                <div className="text-3xl md:text-4xl font-bold mb-2">{formatNaira(walletBalance)}</div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-emerald-100">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 text-emerald-200" />
                    <span className="text-emerald-100">Last updated: Just now</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Payment Method</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.key}
                      onClick={() => setPaymentMethod(method.key)}
                      className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === method.key
                          ? "border-emerald-500 bg-emerald-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className={`p-3 rounded-lg mb-3 ${
                        paymentMethod === method.key ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-600"
                      }`}>
                        {method.icon}
                      </div>
                      <span className="font-medium text-gray-900 text-sm text-center">{method.name}</span>
                      <span className="text-xs text-gray-500 mt-1 text-center hidden md:block">
                        {method.description.split(' ')[0]}...
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount Selection */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Amount to Fund</h2>
                  <span className="text-sm text-gray-500">Min: ₦100 | Max: ₦1,000,000</span>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => handlePresetSelect(preset)}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                          amount === preset.toString() && !customAmount
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700 font-medium"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
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
                      placeholder="Enter custom amount"
                      min="100"
                      max="1000000"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.amount ? "border-red-300" : "border-gray-300"
                      } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="mt-2 text-sm text-red-600">{errors.amount}</p>
                  )}
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
                <div className="space-y-5">
                  {paymentMethod === "card" && (
                    <>
                      {/* Card Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number <span className="text-red-500">*</span>
                        </label>
                        <div className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors ${
                          errors.cardNumber ? "border-red-300" : "border-gray-300 focus-within:border-emerald-500"
                        }`}>
                          <CreditCard className="h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                            placeholder="1234 5678 9012 3456"
                            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500"
                            inputMode="numeric"
                          />
                          <div className="flex items-center gap-1">
                            <div className="h-6 w-8 bg-red-500 rounded"></div>
                            <div className="h-6 w-8 bg-blue-500 rounded"></div>
                          </div>
                        </div>
                        {errors.cardNumber && (
                          <p className="mt-2 text-sm text-red-600">{errors.cardNumber}</p>
                        )}
                      </div>

                      {/* Card Details Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length >= 2) {
                                value = value.slice(0, 2) + '/' + value.slice(2, 4);
                              }
                              setCardExpiry(value);
                            }}
                            placeholder="MM/YY"
                            maxLength={5}
                            className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
                              errors.cardExpiry ? "border-red-300" : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                            }`}
                          />
                          {errors.cardExpiry && (
                            <p className="mt-2 text-sm text-red-600">{errors.cardExpiry}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="password"
                              value={cardCVV}
                              onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, '').slice(0, 4))}
                              placeholder="123"
                              maxLength={4}
                              className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
                                errors.cardCVV ? "border-red-300" : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                              }`}
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                          {errors.cardCVV && (
                            <p className="mt-2 text-sm text-red-600">{errors.cardCVV}</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {(paymentMethod === "bank" || paymentMethod === "transfer") && (
                    <>
                      {/* Bank Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Your Bank <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {BANKS.map((bank) => (
                            <button
                              key={bank.key}
                              onClick={() => setSelectedBank(bank.key)}
                              type="button"
                              className={`flex flex-col items-center p-3 rounded-lg border transition-all duration-200 ${
                                selectedBank === bank.key
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className={`h-8 w-8 rounded-full ${bank.color} flex items-center justify-center mb-1`}>
                                <span className="text-white text-xs font-bold">{bank.name.charAt(0)}</span>
                              </div>
                              <span className="text-xs font-medium text-gray-900 text-center">{bank.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Account Number */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Account Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="Enter your 10-digit account number"
                          className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors ${
                            errors.accountNumber ? "border-red-300" : "border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                          }`}
                        />
                        {errors.accountNumber && (
                          <p className="mt-2 text-sm text-red-600">{errors.accountNumber}</p>
                        )}
                        {accountNumber.length === 10 && (
                          <p className="mt-2 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4 inline mr-1" />
                            Account number validated
                          </p>
                        )}
                      </div>

                      {/* Account Name */}
                      {accountNumber && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Account Name
                          </label>
                          <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                            <div className="font-medium text-gray-900">John Adeyemi</div>
                            <p className="text-sm text-gray-500">Automatically fetched from bank</p>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {paymentMethod === "ussd" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Bank for USSD
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {BANKS.slice(0, 6).map((bank) => (
                            <button
                              key={bank.key}
                              onClick={() => setSelectedBank(bank.key)}
                              type="button"
                              className={`flex items-center gap-2 p-3 rounded-lg border transition-all duration-200 ${
                                selectedBank === bank.key
                                  ? "border-emerald-500 bg-emerald-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                            >
                              <div className={`h-6 w-6 rounded-full ${bank.color} flex items-center justify-center`}>
                                <span className="text-white text-xs font-bold">{bank.name.charAt(0)}</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900">{bank.name.split(' ')[0]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                        <h4 className="font-medium text-gray-900 mb-2">USSD Code</h4>
                        <div className="flex items-center justify-between">
                          <code className="font-mono text-lg font-bold text-gray-900">
                            {USSD_CODES[selectedBank]?.replace('Amount', amount || '0000')}
                          </code>
                          <button
                            onClick={() => copyToClipboard(USSD_CODES[selectedBank]?.replace('Amount', amount || '0000'))}
                            className="px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">
                          Dial this code on your phone to complete the payment
                        </p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "qr" && (
                    <div className="space-y-4">
                      <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center">
                        <div className="h-48 w-48 bg-gray-300 rounded-lg mb-4 flex items-center justify-center">
                          <QrCode className="h-24 w-24 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-600 text-center mb-4">
                          Scan this QR code with your bank's mobile app to pay
                        </p>
                        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                          Download QR Code
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Show Account Details for Bank Deposit */}
                  {(paymentMethod === "bank" || paymentMethod === "transfer") && (
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">Our Account Details</h4>
                        <button
                          onClick={() => setShowAccountDetails(!showAccountDetails)}
                          className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          {showAccountDetails ? "Hide" : "Show"}
                        </button>
                      </div>
                      
                      {showAccountDetails && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Bank:</span>
                            <span className="font-medium text-gray-900">{generateAccountDetails().bankName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{generateAccountDetails().accountNumber}</span>
                              <button
                                onClick={() => copyToClipboard(generateAccountDetails().accountNumber)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Account Name:</span>
                            <span className="font-medium text-gray-900">{generateAccountDetails().accountName}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Reference:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-900">{generateAccountDetails().reference}</span>
                              <button
                                onClick={() => copyToClipboard(generateAccountDetails().reference)}
                                className="text-emerald-600 hover:text-emerald-700"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <p className="mt-3 text-sm text-gray-600">
                        Use the reference number when making payment to help us track your transaction
                      </p>
                    </div>
                  )}

                  {/* Transaction PIN */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction PIN <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative rounded-xl border px-4 py-3 transition-colors ${
                      errors.pin ? "border-red-300" : "border-gray-300 focus-within:border-emerald-500"
                    }`}>
                      <Shield className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter your 4-6 digit PIN"
                        className="w-full bg-transparent pl-9 outline-none text-gray-900"
                        maxLength={6}
                      />
                    </div>
                    {errors.pin && <p className="mt-2 text-sm text-red-600">{errors.pin}</p>}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !amount}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <Wallet className="h-5 w-5" />
                        Fund Wallet Now
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
                {/* Transaction Summary */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transaction Summary
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Payment Method</span>
                      <span className="font-semibold">
                        {PAYMENT_METHODS.find(m => m.key === paymentMethod)?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Amount</span>
                      <span className="font-semibold">{amount ? formatNaira(Number(amount)) : "-"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Processing Fee</span>
                      <span className="font-semibold text-green-400">₦0</span>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-lg">
                        <span className="text-gray-300">Total to Pay</span>
                        <span className="font-bold text-xl">
                          {amount ? formatNaira(Number(amount)) : "₦0"}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">New Balance</span>
                        <span className="font-bold text-lg text-emerald-300">
                          {amount ? formatNaira(walletBalance + Number(amount)) : formatNaira(walletBalance)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {amount && (
                    <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
                      <div className="flex items-center gap-2 text-sm text-gray-300 mb-2">
                        <Zap className="h-4 w-4" />
                        <span>Instant Credit</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Funds will reflect in your wallet immediately after successful payment
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Transactions */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
                    <Link href="/transactions" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                      View All
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {DEMO_TRANSACTIONS.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                        <div>
                          <div className="font-medium text-gray-900">{formatNaira(transaction.amount)}</div>
                          <div className="text-xs text-gray-500">{transaction.method}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">{transaction.date}</div>
                          <div className={`text-xs font-medium ${
                            transaction.status === 'success' ? 'text-green-600' :
                            transaction.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Info */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Processing Time</span>
                      </div>
                      <span className="font-semibold text-gray-900">Instant</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Security</span>
                      </div>
                      <span className="font-semibold text-green-600">PCI-DSS</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Fees</span>
                      </div>
                      <span className="font-semibold text-green-600">No Fees</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Support</span>
                      </div>
                      <span className="font-semibold text-gray-900">24/7</span>
                    </div>
                  </div>
                </div>

                {/* Support Section */}
                <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Having issues with payment? Contact our support for immediate assistance.
                  </p>
                  <button className="w-full py-2.5 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors">
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