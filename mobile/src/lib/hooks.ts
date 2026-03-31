import { useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "./api";

function usePolling<T>(path: string, intervalMs: number) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFetch<T>(path);
      if (mounted.current) {
        setData(result);
        setError(null);
      }
    } catch (err: any) {
      if (mounted.current) {
        setError(err.message);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [path]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, error, loading, refetch: fetchData };
}

export function useAuthStatus() {
  return usePolling<{ authenticated: boolean }>("/api/auth/status", 10000);
}

export function useProfile() {
  return usePolling<any>("/api/profile", 60000);
}

export function useHoldings() {
  return usePolling<any[]>("/api/holdings", 30000);
}

export function usePositions() {
  return usePolling<{ net: any[]; day: any[] }>("/api/positions", 10000);
}

export function useOrders() {
  return usePolling<any[]>("/api/orders", 15000);
}

export function useMargins() {
  return usePolling<any>("/api/margins", 30000);
}

export function useQuote(instruments: string) {
  return usePolling<any>(`/api/quote?instruments=${encodeURIComponent(instruments)}`, 5000);
}
