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
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${
        active
          ? "bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10"
          : "text-gray-600 hover:bg-gray-100/50 hover:text-gray-900"
      }`}
    >
      <div className={`transition-transform group-hover:scale-110 ${
        active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
      }`}>
        {icon}
      </div>
      <span className="flex-1 text-left">{label}</span>
      {active && (
        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
      )}
    </button>
  );
}