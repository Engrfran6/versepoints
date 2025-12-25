import {createClient} from "@/lib/supabase/server";
import {AdminMiningContent} from "@/components/admin/admin-mining-content";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function AdminMiningPage() {
  // Get mining sessions with user info
  const {data: sessions} = await supabaseAdmin
    .from("mining_sessions")
    .select(
      `
      *,
      users (
        username,
        email
      )
    `
    )
    .order("created_at", {ascending: false})
    .limit(100);

  return <AdminMiningContent sessions={sessions || []} />;
}
