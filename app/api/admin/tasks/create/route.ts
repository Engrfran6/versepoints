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

    const taskData = await request.json();

    const {error: insertError} = await supabaseAdmin.from("tasks").insert({
      title: taskData.title,
      description: taskData.description,
      points_reward: taskData.points_reward,
      task_type: taskData.task_type,
      platform: taskData.platform || null,
      starts_at: taskData.starts_at || null,
      ends_at: taskData.ends_at || null,
      action_url: taskData.action_url || null,
      verification_type: taskData.verification_type || "manual",
      is_active: true,
    });

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({success: true});
  } catch (error: any) {
    console.error("Task creation error:", error);
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
