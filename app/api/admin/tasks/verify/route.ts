import {type NextRequest, NextResponse} from "next/server";
import {createClient} from "@/lib/supabase/server";
import {supabaseAdmin} from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: {user},
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({error: "Unauthorized"}, {status: 401});
    }

    // Check if user is admin
    const {data: userData} = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {submissionId, approved, reason} = await request.json();

    const {data: submission, error: submissionError} = await supabaseAdmin
      .from("task_submissions")
      .select("*, tasks(*)")
      .eq("id", submissionId)
      .single();

    if (submissionError || !submission) {
      return NextResponse.json({error: "Submission not found"}, {status: 404});
    }

    if (approved) {
      await supabaseAdmin
        .from("task_submissions")
        .update({
          status: "verified",
          verified_at: new Date().toISOString(),
          points_awarded: submission.tasks.points_reward,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      const {data: currentUser} = await supabaseAdmin
        .from("users")
        .select("points_balance")
        .eq("id", submission.user_id)
        .single();

      await supabase
        .from("users")
        .update({
          points_balance: (currentUser?.points_balance || 0) + submission.tasks.points_reward,
        })
        .eq("id", submission.user_id);
    } else {
      await supabaseAdmin
        .from("task_submissions")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || "Does not meet requirements",
        })
        .eq("id", submissionId);
    }

    return NextResponse.json({success: true});
  } catch (error: any) {
    console.error("Task verification error:", error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
