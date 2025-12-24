"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Eye, 
  EyeOff, 
  ChevronRight,
  Wallet,
  Wifi,
  Tv,
  Smartphone
} from "lucide-react";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Redirect to dashboard after successful login/signup
      router.push("/dashboard");
    }, 1000);
  };

  const features = [
    { icon: <Wifi className="h-5 w-5" />, label: "Data Plans", desc: "Instant top-ups" },
    { icon: <Smartphone className="h-5 w-5" />, label: "Airtime", desc: "Quick recharge" },
    { icon: <Tv className="h-5 w-5" />, label: "Cable TV", desc: "Subscriptions" },
    { icon: <Wallet className="h-5 w-5" />, label: "Wallet", desc: "Secure funds" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-gray-50 to-blue-50/50">
      {/* Left Side - Brand & Features (Desktop) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-8 lg:p-12 flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Majire Sub</h1>
              <p className="text-blue-100 text-sm">VTU Services Platform</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Your All-in-One <br />VTU Solution
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <div className="text-white">{feature.icon}</div>
                  </div>
                  <span className="text-white font-medium">{feature.label}</span>
                </div>
                <p className="text-blue-100 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">99.9% Uptime</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">Instant Delivery</span>
          </div>
          <div className="flex items-center gap-2 text-blue-100">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm">24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-md">
          {/* Logo for Mobile */}
          <div className="md:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Majire Sub</h1>
              <p className="text-gray-500 text-sm">VTU Services Platform</p>
            </div>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-8">
            {/* Auth Mode Tabs */}
            <div className="flex mb-6">
              <button
                onClick={() => setAuthMode("login")}
                className={`flex-1 py-3 text-center font-medium rounded-l-xl transition-colors ${
                  authMode === "login"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-3 text-center font-medium rounded-r-xl transition-colors ${
                  authMode === "signup"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Title */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                {authMode === "login" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-500 mt-1">
                {authMode === "login" 
                  ? "Enter your credentials to access your account" 
                  : "Sign up to start using our services"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {authMode === "signup" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        placeholder="John"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        placeholder="Doe"
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="0801 234 5678"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="••••••••"
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}

              {authMode === "login" && (
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {authMode === "signup" && (
                <label className="flex items-start gap-3 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    I agree to the{" "}
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button type="button" className="text-blue-600 hover:text-blue-700 font-medium">
                      Privacy Policy
                    </button>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-medium shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {authMode === "login" ? "Logging in..." : "Creating Account..."}
                  </>
                ) : (
                  <>
                    {authMode === "login" ? "Login to Account" : "Create Account"}
                    <ChevronRight className="h-5 w-5" />
                  </>
                )}
              </button>

              {/* Mobile Features Grid */}
              <div className="md:hidden grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gray-200">
                {features.map((feature, index) => (
                  <div key={index} className="bg-blue-50 rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <div className="text-blue-600">{feature.icon}</div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{feature.label}</span>
                    </div>
                    <p className="text-xs text-gray-500">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </form>

            {/* Footer Links */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                {authMode === "login"
                  ? "Don't have an account? "
                  : "Already have an account? "}
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {authMode === "login" ? "Sign up here" : "Login here"}
                </button>
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-6 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Majire Sub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}