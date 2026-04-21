interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold tracking-tight transition-all duration-300 group ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30 active-glow"
          : "text-slate-500 hover:bg-slate-100/80 hover:text-slate-900"
      }`}
    >
      <div className={`transition-all duration-300 group-hover:scale-110 ${
        active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
      }`}>
        {icon}
      </div>
      <span className="flex-1 text-left">{label}</span>
      {active && (
        <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" />
      )}
    </button>
  );
}