import {MINING_CONSTANTS} from "@/lib/constants";
import {createClient} from "@/lib/supabase/server";
import {NextResponse} from "next/server";

const WELCOME_BONUS = MINING_CONSTANTS.WELCOME_BONUS;

export async function POST() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({success: false, error: "Unauthorized"}, {status: 401});
    }

    const createdAt = new Date(user.created_at).getTime();
    if (Date.now() - createdAt > 24 * 60 * 60 * 1000) {
      return NextResponse.json({success: false, error: "Welcome bonus expired"}, {status: 400});
    }

    // Fetch user record
    const {data: userData, error: userError} = await supabase
      .from("users")
      .select("points_balance, welcome_bonus_claimed")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json({success: false, error: "User not found"}, {status: 404});
    }

    // Prevent double-claim
    if (userData.welcome_bonus_claimed) {
      return NextResponse.json(
        {success: false, error: "Welcome bonus already claimed"},
        {status: 400}
      );
    }

    // Atomic update
    const {data: updatedUser, error: updateError} = await supabase
      .from("users")
      .update({
        points_balance: userData.points_balance + WELCOME_BONUS,
        welcome_bonus_claimed: true,
      })
      .eq("id", user.id)
      .select("points_balance")
      .single();

    if (updateError) {
      return NextResponse.json({success: false, error: "Failed to claim bonus"}, {status: 500});
    }

    await supabase.from("audit_log").insert({
      user_id: user.id,
      action: "welcome_bonus_claimed",
      metadata: {points: 1000},
    });

    return NextResponse.json({
      success: true,
      pointsAwarded: WELCOME_BONUS,
      newBalance: updatedUser.points_balance,
    });
  } catch (error) {
    console.error("WELCOME_BONUS_ERROR:", error);
    return NextResponse.json({success: false, error: "Internal server error"}, {status: 500});
  }
}
