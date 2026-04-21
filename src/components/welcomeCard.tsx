import { useState, useEffect } from "react";

export default function WelcomeCard() {
  const [name, setName] = useState("User");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      // Try to get first name
      const firstName = u.full_name ? u.full_name.split(" ")[0] : "User";
      setName(firstName);
    }
  }, []);

  return (
    <div className="lg:col-span-2 glass-card rounded-3xl p-5 soft-shadow transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-1 tracking-tight">
            Good Day, {name}! 👋
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/50 border border-blue-100/50 px-2.5 py-1 rounded-full">
          Live Status
        </div>
      </div>
    </div>
  );
}