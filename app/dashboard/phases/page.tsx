import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import type {PlatformPhase} from "@/lib/types/phase2";
import {PhasesPageContent} from "./phases-page-content";

export default async function PhasesPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <PhasesPageContent />;
}
