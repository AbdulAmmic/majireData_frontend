import { Wifi, Phone, Tv, GraduationCap, Banknote, Zap } from "lucide-react";
import Link from "next/link";

const quickActions = [
  { icon: <Wifi className="w-5 h-5" />, label: "Buy Data", color: "bg-blue-500", href: "/dashboard/buyData" },
  { icon: <Phone className="w-5 h-5" />, label: "Airtime", color: "bg-green-500", href: "/dashboard/buyAirtime" },
  { icon: <Tv className="w-5 h-5" />, label: "Cable TV", color: "bg-purple-500", href: "/dashboard/cableSub" },
  { icon: <Zap className="w-5 h-5" />, label: "Electricity", color: "bg-yellow-500", href: "/dashboard/electricity" },
  { icon: <GraduationCap className="w-5 h-5" />, label: "Education", color: "bg-indigo-500", href: "/dashboard/buyEpin" },
  { icon: <Banknote className="w-5 h-5" />, label: "Airtime-Cash", color: "bg-pink-500", href: "/dashboard/airtime-cash" },
];

export default function QuickActions() {
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="flex flex-col items-center gap-3 p-4 bg-white border border-gray-100/50 rounded-xl hover:shadow-md hover:border-gray-200/50 transition-all duration-200 group"
          >
            <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}