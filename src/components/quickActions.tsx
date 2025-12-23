import { Wifi, Phone, Tv, Plus } from "lucide-react";

const quickActions = [
  { icon: <Wifi className="w-5 h-5" />, label: "Buy Data", color: "bg-blue-500" },
  { icon: <Phone className="w-5 h-5" />, label: "Buy Airtime", color: "bg-green-500" },
  { icon: <Tv className="w-5 h-5" />, label: "Cable TV", color: "bg-purple-500" },
  { icon: <Plus className="w-5 h-5" />, label: "More", color: "bg-gray-500" },
];

export default function QuickActions() {
  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {quickActions.map((action, index) => (
          <button
            key={index}
            className="flex flex-col items-center gap-3 p-4 bg-white border border-gray-100/50 rounded-xl hover:shadow-md hover:border-gray-200/50 transition-all duration-200 group"
          >
            <div className={`p-3 rounded-xl ${action.color} text-white group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-sm font-medium text-gray-700">{action.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}