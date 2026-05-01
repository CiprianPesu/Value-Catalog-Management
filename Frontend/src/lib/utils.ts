import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const colors = {
  gray_light: "#6b7280", // gray-500
  blue_light: "#06b6d4", // cyan-500
  green_light: "#4ade80", // green-400
  orange_cnas: "#b44739",
  blue_cnas: "#2d2e62",
};
