import {clsx, type ClassValue} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);

    // 1️⃣ Standard watch URLs
    if (parsedUrl.searchParams.get("v")) {
      return parsedUrl.searchParams.get("v");
    }

    // 2️⃣ Shorts URLs
    if (parsedUrl.pathname.startsWith("/shorts/")) {
      return parsedUrl.pathname.split("/shorts/")[1]?.split("?")[0] || null;
    }

    // 3️⃣ youtu.be URLs
    if (parsedUrl.hostname === "youtu.be") {
      return parsedUrl.pathname.substring(1);
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Converts a number to a short format
 * 1000 -> 1k, 1500 -> 1.5k, 2000000 -> 2M
 */
export function formatNumberShort(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(num % 1_000 === 0 ? 0 : 1)}k`;
  } else {
    return num.toString();
  }
}
