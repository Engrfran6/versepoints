// app/auth/callback/route.ts
import {createClient} from "@/lib/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const code = searchParams.get("code");

  const next =
    searchParams.get("next") || searchParams.get("redirect_to") || searchParams.get("returnTo");

  const safeNext = next?.startsWith("/") ? next : "/dashboard";

  const origin = request.headers.get("origin") || url.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?error=Missing auth code`);
  }

  const supabase = await createClient();
  const {data, error} = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/error?error=Authentication failed`);
  }

  /**
   * 🔹 OPTIONAL: First-login onboarding hook
   * (safe to remove if you already handle this elsewhere)
   */
  // try {
  //   await supabase.from("users").upsert(
  //     {
  //       id: data.user.id,
  //       email: data.user.email,
  //     },
  //     {onConflict: "id"}
  //   );
  // } catch {
  //   // Never block login
  // }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
