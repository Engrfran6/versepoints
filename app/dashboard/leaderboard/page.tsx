import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {Suspense} from "react";
import {LeaderboardContent} from "./leaderboard-content";

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <LeaderboardContent currentUserId={user.id} />;
}
