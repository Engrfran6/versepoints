"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import {supabase} from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const LoginTransition = dynamic(
  () => import("@/components/3d/login-transition").then((mod) => mod.LoginTransition),
  {ssr: false}
);

export default function AuthTransitionClient() {
  const router = useRouter();
  const params = useSearchParams();

  const to = params.get("to");

  useEffect(() => {
    supabase.auth.getSession().then(({data}) => {
      if (!data.session) router.replace("/auth/login");
    });
  }, [router]);

  return <LoginTransition isActive onComplete={() => router.replace(`/${to}`)} />;
}
