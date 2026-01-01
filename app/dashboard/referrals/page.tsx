import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {ReferralsContent} from "./referrals-content";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function ReferralsPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data
  const {data: userData} = await supabase
    .from("users")
    .select("referral_code, total_referral_earnings")
    .eq("id", user.id)
    .single();

  // Get referrals with user info
  const {data: referrals} = await supabaseAdmin
    .from("referrals")
    .select(
      `
      id,
      status,
      created_at,
      referred:referred_id (
        username,
        mining_count
      )
    `
    )
    .eq("referrer_id", user.id)
    .order("created_at", {ascending: false});

  // Get referral earnings
  const {data: earnings} = await supabase
    .from("referral_earnings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {ascending: false})
    .limit(10);

  return (
    <ReferralsContent userData={userData} referrals={referrals || []} earnings={earnings || []} />
  );
}
