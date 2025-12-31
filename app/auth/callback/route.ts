// app/auth/callback/route.ts
import {createClient} from "@/lib/supabase/server";
import {NextResponse} from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const token = searchParams.get("token"); // magic link / signup token
  const type = searchParams.get("type"); // 'recovery' for reset-password
  const next =
    searchParams.get("next") || searchParams.get("redirect_to") || searchParams.get("returnTo");

  const safeNext = next?.startsWith("/") ? next : "/dashboard";
  const origin = request.headers.get("origin") || url.origin;

  const supabase = await createClient();

  // ✅ Magic link / signup confirmation
  if (token && type !== "recovery") {
    const {error} = await supabase.auth.exchangeCodeForSession(token);

    if (error) {
      return NextResponse.redirect(`${origin}/auth/error?error=Authentication failed`);
    }
  }

  // ✅ Recovery flow (password reset)
  // Supabase handles session hydration on the client, no server exchange needed
  // type === "recovery" links still work

  return NextResponse.redirect(`${origin}${safeNext}`);
}
