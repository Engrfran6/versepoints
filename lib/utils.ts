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

export function formatNumberShort2(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`;
  } else if (num >= 100_000) {
    return `${(num / 100_000).toFixed(num % 100_000 === 0 ? 0 : 1)}k`;
  } else {
    return num.toString();
  }
}

export const getErrorMessage = (err: unknown, fallback = "Something went wrong") => {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
};

export const mapLoginAuthError = (message: string) => {
  if (message.includes("Invalid login credentials")) return "Incorrect email or password.";

  if (message.includes("Email not confirmed")) return "Please verify your email before signing in.";

  if (message.includes("User not found")) return "No account found with this email.";

  if (message.includes("Too many requests")) return "Too many attempts. Please try again later.";

  return "Unable to sign in. Please try again.";
};

export const mapAuthError = (message: string) => {
  const msg = message.toLowerCase();

  if (
    msg.includes("user already registered") ||
    msg.includes("already exists") ||
    msg.includes("duplicate")
  ) {
    return "We couldn’t create your account with these details.";
  }
  if (msg.includes("database error")) {
    return "We couldn’t create your account. If you already have one, try signing in.";
  }

  if (msg.includes("password")) {
    return "Password does not meet security requirements.";
  }

  if (msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }

  if (msg.includes("rate limit")) {
    return "Too many attempts. Please wait a moment and try again.";
  }

  return "Sign up failed. Please try again.";
};
