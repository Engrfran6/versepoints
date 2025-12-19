import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SettingsContent } from "@/components/dashboard/settings-content"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user data
  const { data: userData } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (!userData) {
    redirect("/auth/login")
  }

  return <SettingsContent user={userData} email={user.email || ""} />
}
