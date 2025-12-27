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

    const {data: userData} = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!userData?.is_admin) {
      return NextResponse.json({error: "Forbidden"}, {status: 403});
    }

    const {taskId, status} = await request.json();

    const newStatus = status === "active" ? "paused" : "active";

    const {data, error} = await supabaseAdmin
      .from("tasks")
      .update({status: newStatus})
      .eq("id", taskId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      updatedTask: data,
    });
  } catch (error: any) {
    return NextResponse.json({error: error.message}, {status: 500});
  }
}
