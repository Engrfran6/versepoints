// app/auth/callback/route.ts
import {createClient} from "@/lib/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const code = searchParams.get("code"); // OAuth / magic link
  const type = searchParams.get("type"); // recovery
  const next =
    searchParams.get("next") || searchParams.get("redirect_to") || searchParams.get("returnTo");

  const safeNext = next?.startsWith("/") ? next : "/dashboard";
  const origin = request.headers.get("origin") || url.origin;

  const supabase = await createClient();

  // ✅ ONLY exchange code for OAuth / magic links
  if (code) {
    const {error} = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/auth/error?error=Authentication failed`);
    }
  }

  // ✅ Recovery flow: do NOTHING — Supabase handles it
  if (type === "recovery") {
    // session will hydrate on the client
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
