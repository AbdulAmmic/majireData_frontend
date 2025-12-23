"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  PhoneCall,
  CreditCard,
  Wallet,
  User,
} from "lucide-react";

const navItems = [
  { name: "Home", icon: Home, href: "/dashboard" },
  { name: "Buy", icon: PhoneCall, href: "/buy-data" },
  { name: "Bills", icon: CreditCard, href: "/bills" },
  { name: "Wallet", icon: Wallet, href: "/wallet" },
  { name: "Profile", icon: User, href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-slate-900/80 backdrop-blur-lg border-t border-slate-700/50 text-white z-40">
      <ul className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <li key={item.name} className="relative">
              <Link
                href={item.href}
                className="flex flex-col items-center text-xs"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full transition ${
                    active
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-blue-500/30"
                      : "text-gray-400"
                  }`}
                >
                  <Icon size={22} />
                </motion.div>
                <span
                  className={`mt-1 text-[11px] ${
                    active ? "text-cyan-400 font-semibold" : "text-gray-400"
                  }`}
                >
                  {item.name}
                </span>
              </Link>

              {/* Animated underline */}
              {active && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-1/2 w-6 h-[2px] bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full -translate-x-1/2"
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
