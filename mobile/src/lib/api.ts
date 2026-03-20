const API_BASE = __DEV__
  ? "http://192.168.1.100:8000"  // Change to your computer's local IP
  : "https://your-production-api.com";

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

export async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(apiUrl(path), {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export function setApiBase(url: string) {
  // Allow runtime override for dev
  (globalThis as any).__API_BASE__ = url;
}
