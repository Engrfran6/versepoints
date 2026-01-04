"use client";

import type React from "react";
import {Suspense, useEffect} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {supabase} from "@/lib/supabase/client";
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
import {Spinner} from "@/components/ui/spinner";

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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
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

    const result = forgotPasswordSchema.safeParse({email});
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input email");
      setIsResetting(false);
      return;
    }

    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL_PROD}/auth/callback?next=/auth/reset-password`,
      });

      setResetEmailSent(true);
      setResendCountdown(RESEND_COOLDOWN);
    } catch (error) {
      ("");
    } finally {
      setIsResetting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsOAuthLoading(true);

    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL_PROD}/auth/callback`,
        },
      });
    } catch {
      setError("Google sign-in failed");
    } finally {
      setIsOAuthLoading(false);
    }
  };

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

  const RESEND_COOLDOWN = 300; // 5 minutes

  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  useEffect(() => {
    if (resendCountdown === null) return;

    if (resendCountdown <= 0) {
      setResendCountdown(null);
      return;
    }

    const timer = setInterval(() => {
      setResendCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-2 py-4 bg-background">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0">
          <FloatingParticles count={1000} color="#00d9ff" className="opacity-30" />
        </div>
      </Suspense>

      <div className="relative z-10 flex items-center justify-center w-full">
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
            <Link href="/" className="flex items-center justify-center gap-2">
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
                <CardTitle className="text-2xl text-foreground">
                  {isForgotPassword ? "Reset Password" : "Welcome Back"}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {isForgotPassword
                    ? "Enter your email and we’ll send a reset link"
                    : "Continue earning with VersePoints"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  <form onSubmit={handleLogin} noValidate>
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
                          // disabled={isLoggingIn || isOAuthLoading || resetEmailSent}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-input border-border text-foreground"
                        />
                      </div>
                      {!isForgotPassword && (
                        <div className="grid gap-2">
                          <Label htmlFor="password" className="text-foreground">
                            Password
                          </Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              // disabled={isLoggingIn || isOAuthLoading || resetEmailSent}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="bg-input border-border text-foreground pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={showPassword ? "Hide password" : "Show password"}
                              aria-pressed={showPassword}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPassword ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                      {error && <p className="text-sm text-destructive text-center">{error}</p>}
                      {!isForgotPassword ? (
                        <Button
                          type="submit"
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                          disabled={isLoggingIn || !email || !password}>
                          {isLoggingIn ? (
                            <>
                              <Spinner className="size-5" /> Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleForgotPassword();
                              setIsForgotPassword(true);
                            }}
                            disabled={isResetting || resendCountdown !== null || !email}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2">
                            {isResetting ? (
                              <>
                                <Spinner className="size-5" /> Processing...
                              </>
                            ) : (
                              "Send reset link"
                            )}
                          </Button>

                          {resetEmailSent && (
                            <div className="space-y-2">
                              <p className="text-xs text-green-500 text-center">
                                If an account exists for this email, a reset link has been sent.
                              </p>
                              <p className="text-xs text-center">
                                Check your inbox — delivery may take a few minutes.
                              </p>
                            </div>
                          )}
                          {resendCountdown !== null && (
                            <p className="text-xs text-muted-foreground text-center">
                              You can resend the link in{" "}
                              <span className="font-medium text-foreground">
                                {Math.floor(resendCountdown / 60)
                                  .toString()
                                  .padStart(2, "0")}
                                :{(resendCountdown % 60).toString().padStart(2, "0")}
                              </span>
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </form>

                  {!isForgotPassword && (
                    <div className="flex justify-end text-sm">
                      <button
                        onClick={() => setIsForgotPassword(true)}
                        disabled={isResetting}
                        className="text-primary hover:underline underline-offset-4">
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {!isForgotPassword && (
                    <>
                      <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                          <span className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">
                            Or continue with
                          </span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGoogleSignIn}
                        disabled={isOAuthLoading}
                        className="w-full flex items-center gap-2 justify-center">
                        <Image
                          src="/google-color.svg"
                          width={500}
                          height={500}
                          alt="google logo"
                          className="size-5"
                        />
                        Sign in with Google
                      </Button>
                    </>
                  )}
                </div>

                {isForgotPassword && (
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    <button
                      onClick={() => setIsForgotPassword(false)}
                      className="text-primary hover:underline underline-offset-4">
                      Go back
                    </button>
                  </div>
                )}
                {!isForgotPassword && (
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/sign-up"
                      className="text-primary hover:underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
