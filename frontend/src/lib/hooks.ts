import useSWR from "swr";
import { apiFetch } from "./api";

const fetcher = <T>(path: string) => apiFetch<T>(path);

export function useAuthStatus() {
  return useSWR<{ authenticated: boolean }>("/api/auth/status", fetcher, {
    refreshInterval: 10000,
  });
}

export function useProfile() {
  return useSWR("/api/profile", fetcher);
}

export function useHoldings() {
  return useSWR("/api/holdings", fetcher, { refreshInterval: 30000 });
}

export function usePositions() {
  return useSWR<{ net: any[]; day: any[] }>("/api/positions", fetcher, {
    refreshInterval: 10000,
  });
}

export function useOrders() {
  return useSWR("/api/orders", fetcher, { refreshInterval: 15000 });
}

export function useMargins() {
  return useSWR("/api/margins", fetcher, { refreshInterval: 30000 });
}

export function useQuote(instruments: string) {
  return useSWR(
    instruments ? `/api/quote?instruments=${encodeURIComponent(instruments)}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
}
