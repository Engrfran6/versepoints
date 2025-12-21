"use client";

import {createClient} from "@/lib/supabase/client";
import {Button} from "./ui/button";
import {useRouter} from "next/navigation";
import {LogOut} from "lucide-react";

const Logout = () => {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <Button variant="ghost" className="text-sm font-medium" onClick={() => handleLogout()}>
      <LogOut className="h-5 w-5" />
      Logout
    </Button>
  );
};
export default Logout;
