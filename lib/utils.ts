import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function whatsappUrl(number: string, message?: string) {
  const cleaned = number.replace(/\D/g, "");
  const withCountry = cleaned.startsWith("91") ? cleaned : `91${cleaned}`;
  const base = `https://wa.me/${withCountry}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback;
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

export function generateOrderNumber() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `TR-${ymd}-${Math.floor(Math.random() * 9000 + 1000)}`;
}
