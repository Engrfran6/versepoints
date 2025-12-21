import {NextResponse} from "next/server";

import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const {email} = await req.json();

  const {error} = await supabaseAdmin.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return NextResponse.json({success: false, error: error.message}, {status: 400});
  }

  return NextResponse.json({success: true});
}
