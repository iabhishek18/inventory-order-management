import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number.isFinite(num) ? num : 0);
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function extractApiError(error: unknown, fallback = "Something went wrong"): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const resp = (error as { response?: { data?: unknown } }).response;
    const data = resp?.data;
    if (typeof data === "object" && data !== null && "detail" in data) {
      const detail = (data as { detail: unknown }).detail;
      if (typeof detail === "string") return detail;
      if (Array.isArray(detail)) return detail.map((d) => (typeof d === "object" && d !== null && "msg" in d ? String((d as { msg: unknown }).msg) : String(d))).join(", ");
    }
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
