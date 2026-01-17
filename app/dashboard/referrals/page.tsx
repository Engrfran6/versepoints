// app/dashboard/referrals/page.tsx
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {ReferralsContent} from "./referrals-content";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function ReferralsPage() {
  const supabase = await createClient();

  // Get the currently logged-in user
  const {
    data: {user},
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/auth/login");
  }

  // Fetch user info
  const {data: userData, error: userDataError} = await supabase
    .from("users")
    .select("referral_code, total_referral_earnings")
    .eq("id", user.id)
    .single();

  if (userDataError) {
    console.error(userDataError);
  }

  // Fetch referrals — server-side client respects RLS
  const {data: referrals, error: referralsError} = await supabaseAdmin
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

  if (referralsError) {
    console.error(referralsError);
  }

  // Fetch referral earnings
  const {data: earnings, error: earningsError} = await supabase
    .from("referral_earnings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", {ascending: false})
    .limit(10);

  if (earningsError) {
    console.error(earningsError);
  }

  return (
    <ReferralsContent
      userData={userData || {referral_code: "", total_referral_earnings: 0}}
      referrals={referrals || []}
      earnings={earnings || []}
    />
  );
}
