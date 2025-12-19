import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
