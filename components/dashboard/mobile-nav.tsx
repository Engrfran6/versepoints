"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {cn} from "@/lib/utils";
import {
  LayoutDashboard,
  Crown,
  Trophy,
  Store,
  Settings,
  LogOut,
  Menu,
  CheckSquare,
  Users,
  FileText,
  DollarSign,
  Rocket,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {createClient} from "@/lib/supabase/client";
import {useState} from "react";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const mainNavItems = [
    {href: "/dashboard", icon: LayoutDashboard, label: "Home"},
    {href: "/dashboard/tasks", icon: CheckSquare, label: "Tasks"},
    {href: "/dashboard/nfts", icon: Store, label: "NFTs"},
    {href: "/dashboard/rank", icon: Crown, label: "Rank"},
  ];

  const moreNavItems = [
    {href: "/dashboard/leaderboard", icon: Trophy, label: "Leaders"},
    {href: "/dashboard/referrals", icon: Users, label: "Referrals"},
    {href: "/dashboard/whitepaper", icon: FileText, label: "Whitepaper"},
    {href: "/dashboard/withdraw", icon: DollarSign, label: "Withdraw"},
    {href: "/dashboard/phases", icon: Rocket, label: "Roadmap"},
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm md:hidden">
        <div className="flex items-center justify-around py-2">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {/* Menu Trigger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors",
                  open ? "text-primary" : "text-muted-foreground"
                )}>
                <Menu className="h-5 w-5" />
                More
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-8">
                {moreNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-accent"
                    )}
                    onClick={() => setOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                ))}

                <div className="border-t border-border my-2" />

                <Link
                  href="/dashboard/settings"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === "/dashboard/settings"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent"
                  )}
                  onClick={() => setOpen(false)}>
                  <Settings className="h-5 w-5" />
                  Settings
                </Link>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium"
                  onClick={() => {
                    handleLogout();
                    setOpen(false);
                  }}>
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
