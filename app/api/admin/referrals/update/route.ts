import {supabaseAdmin} from "@/lib/supabase/admin";
import {createClient} from "@/lib/supabase/server";

import {type NextRequest, NextResponse} from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  try {
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    console.log("user=====>", user);

    // Check if user is admin
    const {data: userData} = await supabaseAdmin
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {referralId, status} = await request.json();

    const {error: updateError} = await supabaseAdmin
      .from("referrals")
      .update({status})
      .eq("id", referralId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({success: true});
  } catch (error: any) {
    console.error("Referral update error:", error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
