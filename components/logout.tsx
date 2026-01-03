"use client";

import {supabase} from "@/lib/supabase/client";
import {Button} from "./ui/button";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Button variant="ghost" className="text-sm font-medium" onClick={() => handleLogout()}>
      <LogOut className="h-5 w-5" />
      Logout
    </Button>
  );
};
export default Logout;
