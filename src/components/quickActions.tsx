import { Wifi, Phone, Tv, GraduationCap, Banknote, Zap } from "lucide-react";
import Link from "next/link";

const quickActions = [
  { icon: <Wifi className="w-5 h-5" />, label: "Data", color: "bg-blue-500", href: "/dashboard/buyData" },
  { icon: <Phone className="w-5 h-5" />, label: "Airtime", color: "bg-green-500", href: "/dashboard/buyAirtime" },
  { icon: <Tv className="w-5 h-5" />, label: "Cable", color: "bg-purple-500", href: "/dashboard/cableSub" },
  { icon: <Zap className="w-5 h-5" />, label: "Power", color: "bg-amber-500", href: "/dashboard/electricity" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Exams", color: "bg-indigo-500", href: "/dashboard/buyEpin" },
  { icon: <Banknote className="w-5 h-5" />, label: "To-Cash", color: "bg-rose-500", href: "/dashboard/airtime-cash" },
];

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 ml-4">
        Quick Services
      </h3>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex flex-col items-center gap-3 p-4 glass-card rounded-[2rem] soft-shadow transition-all duration-300 hover:shadow-lg active:scale-95 group"
          >
            <div className={`p-4 rounded-2xl ${action.color} text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
              {action.icon}
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 text-center leading-tight">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}