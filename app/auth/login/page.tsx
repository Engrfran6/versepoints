"use client";

import type React from "react";
import {Suspense} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {useState} from "react";
import {forgotPasswordSchema, loginSchema} from "@/lib/validations/auth";
import {Eye, EyeOff} from "lucide-react";
import {toast} from "sonner";
import {getErrorMessage, mapLoginAuthError} from "@/lib/utils";

const LoginTransition = dynamic(
  () => import("@/components/3d/login-transition").then((mod) => mod.LoginTransition),
  {
    ssr: false,
  }
);
const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);
const MiningCore = dynamic(
  () => import("@/components/3d/mining-core").then((mod) => ({default: mod.MiningCore})),
  {
    ssr: false,
  }
);

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError(null);

    const result = loginSchema.safeParse({email, password});
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input");
      setIsLoggingIn(false);
      return;
    }

    try {
      const supabase = createClient();

      const {data, error} = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      const {data: userData} = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", data.user.id)
        .single();

      if (userData?.is_admin) {
        return router.replace("/auth/transition?to=admin");
      } else {
        return router.replace("/auth/transition?to=dashboard");
      }
    } catch (err: unknown) {
      const rawMessage = getErrorMessage(err);
      const friendlyMessage = mapLoginAuthError(rawMessage);

      setError(friendlyMessage);
      toast.error(friendlyMessage);
      setIsLoggingIn(false);
    }
  };

  const handleForgotPassword = async () => {
    setIsResetting(true);
    setError(null);

    if (!email) {
      toast.error("Enter your email first");
      setIsResetting(false);
      return;
    }

    const result = forgotPasswordSchema.safeParse({email});
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input email");
      setIsResetting(false);
      return;
    }

    const supabase = createClient();

    try {
      const redirectBase =
        process.env.NODE_ENV === "development"
          ? process.env.NEXT_PUBLIC_SITE_URL
          : "https://verseestate.com";

      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${redirectBase}/auth/callback?next=/auth/reset-password`,
      });

      setResetEmailSent(true);
      toast.success("If an account exists for this email, a reset link has been sent.");
    } catch {
      toast.success("If an account exists for this email, a reset link has been sent.");
    } finally {
      setIsResetting(false);
    }
  };

  // const handleGoogleSignIn = async () => {
  //   setIsOAuthLoading(true);
  //   try {
  //     const res = await fetch("/api/auth/google");
  //     const {url} = await res.json();
  //     window.location.href = url;
  //   } catch {
  //     setError("Google sign-in failed");
  //     setIsOAuthLoading(false);
  //   }
  // };

  if (isTransitioning) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="text-primary text-xl animate-pulse">
              Entering VersePoints Eco-system...
            </div>
          </div>
        }>
        <LoginTransition isActive onComplete={() => setIsTransitioning(false)} />
      </Suspense>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 bg-background overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0">
          <FloatingParticles count={1000} color="#00d9ff" className="opacity-30" />
        </div>
      </Suspense>

      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8">
        {/* 3D Mining Core - Hidden on mobile */}
        <Suspense
          fallback={
            <div className="hidden lg:block w-80 h-80 bg-muted/10 rounded-full animate-pulse" />
          }>
          <div className="hidden lg:block w-80 h-80">
            <MiningCore />
          </div>
        </Suspense>

        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/logo.jpg"
                width={40}
                height={40}
                alt="VerseEstate Logo"
                className="rounded-lg"
              />
              <span className="text-2xl font-bold text-foreground">VersePoints</span>
            </Link>

            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to continue mining
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <form
                    onSubmit={handleLogin}
                    noValidate
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                      }
                    }}>
                    <div className="flex flex-col gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-foreground">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-foreground">
                          Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-input border-border text-foreground pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      {error && <p className="text-sm text-destructive text-center">{error}</p>}
                      <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                        disabled={isLoggingIn}>
                        {isLoggingIn ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </form>

                  <div className="flex justify-end text-sm">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleForgotPassword();
                      }}
                      disabled={isResetting}
                      className="text-primary hover:underline">
                      Forgot password?
                    </button>
                  </div>
                  {resetEmailSent && (
                    <p className="text-xs text-green-500 text-center">Password reset email sent</p>
                  )}
                  {/* <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isOAuthLoading}
                    className="w-full flex items-center gap-2 justify-center">
                    <Facebook className="w-5 h-5" />
                    Sign in with Google
                  </Button> */}
                </div>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/sign-up"
                    className="text-primary hover:underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
