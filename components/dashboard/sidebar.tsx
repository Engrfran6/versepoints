"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import {cn} from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Trophy,
  CheckSquare,
  Wallet,
  Settings,
  LogOut,
  Shield,
  Crown,
  Store,
  Rocket,
  FileText,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {createClient} from "@/lib/supabase/client";
import {useRouter} from "next/navigation";

interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({isAdmin = false}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const mainNavItems = [
    {href: "/dashboard", icon: LayoutDashboard, label: "Dashboard"},
    {href: "/dashboard/rank", icon: Crown, label: "My Rank"},
    {href: "/dashboard/referrals", icon: Users, label: "Referrals"},
    {href: "/dashboard/leaderboard", icon: Trophy, label: "Leaderboard"},
    {href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks"},
    {href: "/dashboard/nfts", icon: Store, label: "NFT Market"},
    {href: "/dashboard/phases", icon: Rocket, label: "Roadmap"},
    {href: "/dashboard/whitepaper", icon: FileText, label: "Whitepaper"},
    {href: "/dashboard/withdraw", icon: Wallet, label: "Withdraw"},
  ];

  const adminNavItems = [{href: "/admin", icon: Shield, label: "Admin Panel"}];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex h-16 items-center gap-2 border-b border-sidebar-border px-6 group">
          <div className="w-8 h-8 rounded-lg overflow-hidden">
            <img
              src="/logo.jpg"
              width="auto"
              height="auto"
              alt="VerseEstate"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-xl font-bold text-sidebar-foreground group-hover:text-primary transition-colors">
            VerseEstate
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="my-4 border-t border-sidebar-border" />
              {adminNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-primary/20 text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              pathname === "/dashboard/settings"
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}>
            <Settings className="h-5 w-5" />
            Settings
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  );
}
