import {supabase} from "@/lib/supabase/client";

export async function fetchPlatformPhases() {
  const {data, error} = await supabase
    .from("platform_phases")
    .select("*")
    .order("phase_number", {ascending: true});
  if (error) throw error;
  return data;
}
