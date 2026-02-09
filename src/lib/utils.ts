import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('de-AT', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('de-AT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'gerade eben';
  if (diffMins < 60) return `vor ${diffMins} Min.`;
  if (diffHours < 24) return `vor ${diffHours} Std.`;
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  return formatDate(d);
}

export const CATEGORIES = [
  { value: 'smartphones', label: 'Smartphones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'desktops', label: 'Desktop PCs' },
  { value: 'tablets', label: 'Tablets' },
  { value: 'monitors', label: 'Monitore' },
  { value: 'peripherals', label: 'Peripherie' },
  { value: 'components', label: 'Komponenten' },
  { value: 'networking', label: 'Netzwerk' },
  { value: 'audio', label: 'Audio' },
  { value: 'wearables', label: 'Wearables' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'other', label: 'Sonstiges' },
] as const;

export const REGIONS = [
  { value: 'wien', label: 'Wien' },
  { value: 'niederoesterreich', label: 'Niederösterreich' },
  { value: 'oberoesterreich', label: 'Oberösterreich' },
  { value: 'salzburg', label: 'Salzburg' },
  { value: 'tirol', label: 'Tirol' },
  { value: 'vorarlberg', label: 'Vorarlberg' },
  { value: 'kaernten', label: 'Kärnten' },
  { value: 'steiermark', label: 'Steiermark' },
  { value: 'burgenland', label: 'Burgenland' },
] as const;

export type Category = typeof CATEGORIES[number]['value'];
export type Region = typeof REGIONS[number]['value'];
