// app/auth/callback/route.ts
import {createClient} from "@/lib/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const code = searchParams.get("code"); // OAuth (Google, GitHub, etc)
  const token = searchParams.get("token"); // Magic link
  const type = searchParams.get("type"); // recovery, signup, etc

  const next = searchParams.get("next") || searchParams.get("redirect_to") || "/dashboard";

  const safeNext = next.startsWith("/") ? next : "/dashboard";
  const origin = request.headers.get("origin") || url.origin;

  const supabase = await createClient();

  try {
    // ✅ OAuth flow (Google)
    if (code) {
      const {error} = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;
    }

    // ✅ Magic link / signup flow
    if (token && type !== "recovery") {
      const {error} = await supabase.auth.exchangeCodeForSession(token);
      if (error) throw error;
    }
  } catch (err) {
    console.error("Auth callback error:", err);
    return NextResponse.redirect(`${origin}/auth/error`);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
