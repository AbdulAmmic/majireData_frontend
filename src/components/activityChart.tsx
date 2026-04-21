import { BarChart2 } from "lucide-react";

export default function ActivityChart() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Analytics</p>
          <p className="text-sm font-bold text-slate-600">Weekly Performance</p>
        </div>
        <div className="bg-blue-50/50 px-3 py-1.5 rounded-xl text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100/30">
          Last 7 Days
        </div>
      </div>
      <div className="flex items-center justify-center h-52 bg-slate-50/30 rounded-[1.75rem] border border-[#f1f5f9] relative overflow-hidden group transition-all duration-500 hover:bg-white hover:shadow-sm">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="text-center relative z-10 transition-transform duration-500 group-hover:scale-110">
          <BarChart2 className="w-8 h-8 text-blue-400 mx-auto mb-3" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Processing Data</p>
          <p className="text-[10px] font-bold text-slate-300 mt-1">Generating visualization...</p>
        </div>
      </div>
    </div>
  );
}