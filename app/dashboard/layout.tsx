import type React from "react";
import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {Sidebar} from "@/components/dashboard/sidebar";
import {MobileNav} from "@/components/dashboard/mobile-nav";
import {Button} from "@/components/ui/button";

export default async function DashboardLayout({children}: {children: React.ReactNode}) {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  // Get user data to check admin status
  const {data: userData} = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return (
    <div className="relative min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar isAdmin={userData?.is_admin || false} />
      </div>

      <Button className="absolute right-4 top-4">Logout</Button>

      {/* Main Content */}
      <main className="md:ml-64 pb-20 md:pb-0">{children}</main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
