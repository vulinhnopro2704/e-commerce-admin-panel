import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateText(text: string, maxLength: number = 25): string {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
}
