"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {
  Shield,
  LayoutDashboard,
  Users,
  Pickaxe,
  AlertTriangle,
  Settings,
  ArrowLeft,
  Crown,
  Store,
  Rocket,
  CheckSquare,
  UserPlus,
  LogOut,
  Zap,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {supabase} from "@/lib/supabase/client";
import {Menu} from "lucide-react";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";
import {useState} from "react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {href: "/admin", icon: LayoutDashboard, label: "Overview"},
    {href: "/admin/users", icon: Users, label: "Users"},
    {href: "/admin/mining", icon: Pickaxe, label: "Mining Activity"},
    // {href: "/admin/boosts", icon: Zap, label: "Boosts"},
    {href: "/admin/referrals", icon: UserPlus, label: "Referrals"},
    {href: "/admin/fraud", icon: AlertTriangle, label: "Fraud Detection"},
    {href: "/admin/ranks", icon: Crown, label: "Rank System"},
    {href: "/admin/tasks", icon: CheckSquare, label: "Tasks Management"},
    {href: "/admin/nfts", icon: Store, label: "NFT Management"},
    {href: "/admin/phases", icon: Rocket, label: "Phase Control"},
    {href: "/admin/settings", icon: Settings, label: "Settings"},
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const NavContent = () => (
    <>
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
            onClick={() => setMobileOpen(false)}>
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          onClick={() => setMobileOpen(false)}>
          <ArrowLeft className="h-5 w-5" />
          Back to Dashboard
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
          onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="bg-background/95 backdrop-blur-sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
                <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
                  <Shield className="w-5 h-5 text-destructive-foreground" />
                </div>
                <span className="text-xl font-bold text-sidebar-foreground">Admin</span>
              </div>
              <NavContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar hidden md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6">
            <div className="w-8 h-8 rounded-lg bg-destructive flex items-center justify-center">
              <Shield className="w-5 h-5 text-destructive-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">Admin Panel</span>
          </div>
          <NavContent />
        </div>
      </aside>
    </>
  );
}
