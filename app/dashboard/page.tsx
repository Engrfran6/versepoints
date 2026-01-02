import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {DashboardContent} from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data
  const {data: userData} = await supabase.from("users").select("*").eq("id", user.id).single();

  if (!userData) {
    redirect("/auth/login");
  }

  if (userData.is_admin) {
    redirect("/admin");
  }

  return <DashboardContent user={userData} />;
}
