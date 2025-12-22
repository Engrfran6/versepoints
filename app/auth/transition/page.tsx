"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {Suspense, useEffect} from "react";
import {createClient} from "@/lib/supabase/client";
import dynamic from "next/dynamic";

const LoginTransition = dynamic(
  () => import("@/components/3d/login-transition").then((mod) => mod.LoginTransition),
  {ssr: false}
);

export default function AuthTransitionPage() {
  const router = useRouter();
  const params = useSearchParams();

  const to = params.get("to") ?? "dashboard";

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({data}) => {
      if (!data.session) router.replace("/auth/login");
    });
  }, [router]);

  return (
    <div>
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="text-primary text-xl animate-pulse">
              Entering VersePoints Eco-system...
            </div>
          </div>
        }>
        <LoginTransition isActive onComplete={() => router.replace(`/${to}`)} />
      </Suspense>
    </div>
  );
}
