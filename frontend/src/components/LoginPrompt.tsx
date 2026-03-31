"use client";

import { apiUrl } from "@/lib/api";

export default function LoginPrompt() {
  const handleLogin = async () => {
    try {
      const res = await fetch(apiUrl("/api/login"));
      const data = await res.json();
      window.location.href = data.login_url;
    } catch {
      alert("Cannot reach API server. Is the backend running?");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-kite-dark-card rounded-2xl p-8 max-w-sm w-full text-center shadow-xl">
        <div className="text-4xl mb-4">📈</div>
        <h1 className="text-2xl font-bold mb-2">Zerodha Dashboard</h1>
        <p className="text-gray-400 mb-6">
          Connect your Kite account to view your portfolio, positions, and orders.
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-kite-green hover:bg-kite-green/90 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Login with Kite
        </button>
      </div>
    </div>
  );
}
