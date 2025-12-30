import {createClient} from "../supabase/client";

const supabase = await createClient();

export async function fetchTasks() {
  const {data, error} = await supabase
    .from("tasks")
    .select("*")
    .eq("is_active", true)
    .order("points_reward", {ascending: false});

  if (error) throw error;
  return data;
}

export async function fetchUserTasks(userId: string) {
  const {data, error} = await supabase.from("task_submissions").select("*").eq("user_id", userId);

  if (error) throw error;
  return data;
}
