"use client";

import { useProfile } from "@/lib/hooks";

export default function Header() {
  const { data } = useProfile();
  const profile = data as any;

  return (
    <header className="bg-kite-dark-card border-b border-gray-800 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold tracking-tight">Zerodha Dashboard</h1>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {profile && (
          <span className="text-gray-400">
            {profile.user_name || profile.user_id}
          </span>
        )}
        <div className="w-2 h-2 rounded-full bg-kite-green animate-pulse" title="Connected" />
      </div>
    </header>
  );
}
