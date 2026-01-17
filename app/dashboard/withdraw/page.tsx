import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {WithdrawContent} from "./withdraw-content";
import {supabaseAdmin} from "@/lib/supabase/admin";

export default async function WithdrawPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data
  const {data: userData} = await supabaseAdmin
    .from("users")
    .select("points_balance, email")
    .eq("id", user.id)
    .single();

  return (
    <WithdrawContent
      pointsBalance={userData?.points_balance || 0}
      userEmail={userData?.email || ""}
    />
  );
}
