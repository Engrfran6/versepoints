import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import type {RankName} from "@/lib/types/phase2";
import {RankPageContent} from "./rank-page-content";

export default async function RankPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <RankPageContent userId={user.id} />;
}
