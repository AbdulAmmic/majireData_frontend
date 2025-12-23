export default function WelcomeCard() {
  return (
    <div className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50/50 border border-gray-100/50 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Good morning, Abdul! 👋
          </h1>
          <p className="text-gray-600 text-sm">
            Here's what's happening with your account today.
          </p>
        </div>
        <div className="text-xs text-gray-500 bg-gray-100/50 px-3 py-1 rounded-full">
          Today
        </div>
      </div>
    </div>
  );
}