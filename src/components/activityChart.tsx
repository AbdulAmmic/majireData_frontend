import { BarChart2 } from "lucide-react";

export default function ActivityChart() {
  return (
    <div className="bg-white border border-gray-100/50 rounded-2xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending Overview</h3>
      <div className="flex items-center justify-center h-48 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
        <div className="text-center">
          <BarChart2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Chart visualization</p>
          <p className="text-xs text-gray-400">Weekly spending analytics</p>
        </div>
      </div>
    </div>
  );
}