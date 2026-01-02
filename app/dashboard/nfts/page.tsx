import {redirect} from "next/navigation";
import {createClient} from "@/lib/supabase/server";
import {Suspense} from "react";
import {NFTMarketplaceContent} from "./nft-marketplace-content";

export default async function NFTMarketplacePage() {
  const supabase = await createClient();

  const {
    data: {user},
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/auth/login");
  }

  return <NFTMarketplaceContent userId={user.id} />;
}
