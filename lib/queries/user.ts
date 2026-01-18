// lib/queries/rank.ts
import {supabase} from "@/lib/supabase/client";

export async function fetchUser(userId: string) {
  const {data, error} = await supabase.from("users").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}
