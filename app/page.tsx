import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-gradient-to-br from-gray-900 to-gray-800 min-h-[calc(100vh-56px)]">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-white">Campus Navigator AR</h1>
        <p className="text-gray-400 text-sm">
          AR-assisted indoor and outdoor campus navigation
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <Link
          href="/navigator"
          className="flex-1 flex flex-col items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl p-6 transition-colors shadow-xl"
        >
          <span className="text-4xl">📡</span>
          <span className="font-semibold text-lg">Navigate</span>
          <span className="text-xs text-blue-200 text-center">
            Open camera + AR overlay
          </span>
        </Link>

        <Link
          href="/admin"
          className="flex-1 flex flex-col items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl p-6 transition-colors shadow-xl"
        >
          <span className="text-4xl">🗺️</span>
          <span className="font-semibold text-lg">Admin</span>
          <span className="text-xs text-gray-400 text-center">
            Manage campus features
          </span>
        </Link>
      </div>

      <p className="text-gray-600 text-xs text-center">
        All data stored locally in your browser. No backend required.
      </p>
    </div>
  );
}
