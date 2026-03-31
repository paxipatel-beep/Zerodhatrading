"use client";

import { useAuthStatus } from "@/lib/hooks";
import LoginPrompt from "@/components/LoginPrompt";
import Header from "@/components/Header";
import HoldingsTable from "@/components/HoldingsTable";
import PositionsTable from "@/components/PositionsTable";
import OrdersTable from "@/components/OrdersTable";
import MarginsSummary from "@/components/MarginsSummary";
import WatchlistCard from "@/components/WatchlistCard";

export default function Home() {
  const { data, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-kite-green border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data?.authenticated) {
    return <LoginPrompt />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-4 max-w-7xl mx-auto w-full">
        {/* Top grid: Watchlist + Margins */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="md:col-span-2">
            <WatchlistCard />
          </div>
          <div>
            <MarginsSummary />
          </div>
        </div>

        {/* Holdings */}
        <div className="mb-4">
          <HoldingsTable />
        </div>

        {/* Positions + Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <PositionsTable />
          <OrdersTable />
        </div>
      </main>

      <footer className="text-center text-xs text-gray-600 py-4">
        Data from Kite Connect &middot; Auto-refreshes
      </footer>
    </div>
  );
}
