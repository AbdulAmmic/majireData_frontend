import { Wallet, MoreVertical } from "lucide-react";

export default function BalanceCard() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl p-6 shadow-lg shadow-blue-500/25">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 opacity-90" />
          <span className="text-sm opacity-90">Available Balance</span>
        </div>
        <MoreVertical className="w-4 h-4 opacity-70" />
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-2xl font-bold tracking-tight">₦12,350.00</p>
          <p className="text-xs opacity-80 mt-1">Abdurrahman Muhammad </p>
        </div>
        
        <div className="flex items-center justify-between text-xs opacity-80">
          <div>
            <p>Account Number</p>
            <p className="font-mono">0123 4567 8901</p>
          </div>
          <button 
          onClick={()=>{
            window.oncopy
          }}
          className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors text-xs">
            Copy
          </button>
        </div>
      </div>
    </div>
  );
}