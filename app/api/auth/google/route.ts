import {NextResponse} from "next/server";

import {supabaseAdmin} from "@/lib/supabase/admin";

export async function GET() {
  const {data, error} = await supabaseAdmin.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (error) {
    return NextResponse.json({error: error.message}, {status: 400});
  }

  return NextResponse.json({url: data.url});
}
