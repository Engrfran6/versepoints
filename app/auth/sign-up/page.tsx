"use client";

import type React from "react";
import {Suspense, useEffect, useState} from "react";
import dynamic from "next/dynamic";
import {supabase} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {passwordRequirements, signUpSchema, type SignUpInput} from "@/lib/validations/auth";
import {Eye, EyeOff, CheckCircle2, XCircle} from "lucide-react";
import {getErrorMessage, mapAuthError} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";

const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  {ssr: false}
);
const SignupPortal3D = dynamic(
  () => import("@/components/3d/signup-portal-3d").then((mod) => mod.SignupPortal3D),
  {
    ssr: false,
  }
);

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return {level: 1, label: "Weak"};
  if (score === 3) return {level: 2, label: "Fair"};
  if (score === 4) return {level: 3, label: "Good"};
  return {level: 4, label: "Strong"};
}

function SignUpForm() {
  const [formData, setFormData] = useState<SignUpInput>({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const passwordStrength = getPasswordStrength(formData.password);

  // Set referral code from URL if present
  useEffect(() => {
    if (refCode && !formData.referralCode) {
      setFormData((prev) => ({...prev, referralCode: refCode}));
    }
  }, [refCode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target as {
      name: keyof SignUpInput;
      value: string;
    };

    setFormData((prev) => ({
      ...prev,
      [name]: name === "username" ? value.trim() : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({...prev, [name]: undefined}));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setServerError(null);
    setErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        email: fieldErrors.email?.[0],
        username: fieldErrors.username?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0],
        referralCode: fieldErrors.referralCode?.[0],
      });

      setIsLoading(false);
      return;
    }

    const data = result.data;

    try {
      let referrerId: string | null = null;

      if (formData.referralCode) {
        const {data: referrer, error: refError} = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", formData.referralCode.toUpperCase())
          .single();

        // Optional: silently ignore invalid referral codes
        if (!refError && referrer) {
          referrerId = referrer.id;
        }
      }

      const {error} = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
          data: {
            username: data.username,
            referred_by: referrerId,
          },
        },
      });

      if (error) throw error;

      router.push("/auth/sign-up-success");
    } catch (err: unknown) {
      const raw = getErrorMessage(err);
      setServerError(mapAuthError(raw));
    } finally {
      setIsLoading(false);
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
      setAuthError("Google sign-in failed! try again later");
    } finally {
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center px-2 py-4 bg-background overflow-hidden">
      {/* 3D Background */}
      <Suspense fallback={null}>
        <div className="fixed inset-0 z-0">
          <FloatingParticles count={1000} color="#8b5cf6" className="opacity-30" />
        </div>
      </Suspense>

      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center gap-8">
        {/* 3D Portal - Hidden on mobile */}
        <Suspense
          fallback={
            <div className="hidden lg:block w-80 h-80 bg-muted/10 rounded-full animate-pulse" />
          }>
          <div className="hidden lg:block w-80 h-80">
            <SignupPortal3D />
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
                <CardTitle className="text-2xl text-foreground">Create Account</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Start mining VersePoints today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp}>
                  <div className="flex flex-col gap-4">
                    {/* Email */}
                    <div className="grid gap-2">
                      <Label htmlFor="email" className="text-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        disabled={isLoading}
                        placeholder="you@example.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={`bg-input border-border text-foreground ${
                          errors.email ? "border-destructive" : ""
                        }`}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    {/* Username */}
                    <div className="grid gap-2">
                      <Label htmlFor="username" className="text-foreground">
                        Username
                      </Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        disabled={isLoading}
                        placeholder="miner123"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`bg-input border-border text-foreground ${
                          errors.username ? "border-destructive" : ""
                        }`}
                      />
                      {errors.username && (
                        <p className="text-sm text-destructive">{errors.username}</p>
                      )}
                    </div>

                    {/* Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="password" className="text-foreground">
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className={`bg-input border-border text-foreground pr-10 ${
                            errors.password ? "border-destructive" : ""
                          }`}
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
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((bar) => {
                            const active = passwordStrength.level >= bar;

                            return (
                              <div
                                key={bar}
                                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                  !active
                                    ? "bg-muted"
                                    : bar === 1
                                    ? "bg-red-500"
                                    : bar === 2
                                    ? "bg-orange-500"
                                    : bar === 3
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                              />
                            );
                          })}
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Strength:{" "}
                          <span
                            className={
                              passwordStrength.level === 1
                                ? "text-red-500"
                                : passwordStrength.level === 2
                                ? "text-orange-500"
                                : passwordStrength.level === 3
                                ? "text-yellow-500"
                                : "text-green-500"
                            }>
                            {passwordStrength.label}
                          </span>
                        </p>
                      </div>

                      <div className="grid items-center grid-cols-2 gap-0.5">
                        {passwordRequirements.map((req) => {
                          const passed = req.test(formData.password);

                          return (
                            <div
                              key={req.label}
                              className="flex items-center gap-2 text-[10px] last:col-span-2">
                              {passed ? (
                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                              ) : req.optional ? (
                                <CheckCircle2 className="w-3 h-3 text-muted-foreground" />
                              ) : (
                                <XCircle className="w-3 h-3 text-muted-foreground" />
                              )}

                              <span
                                className={
                                  passed
                                    ? "text-green-500"
                                    : req.optional
                                    ? "text-muted-foreground"
                                    : "text-muted-foreground"
                                }>
                                {req.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
                          disabled={isLoading}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`bg-input border-border text-foreground ${
                            errors.confirmPassword ? "border-destructive" : ""
                          }`}
                        />
                        {errors.confirmPassword && (
                          <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                        )}

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

                    {/* Referral Code */}
                    <div className="grid gap-2">
                      <Label htmlFor="referralCode" className="text-foreground">
                        Referral Code <span className="text-muted-foreground">(optional)</span>
                      </Label>
                      <Input
                        id="referralCode"
                        name="referralCode"
                        type="text"
                        placeholder="ABCD1234"
                        value={formData.referralCode}
                        onChange={handleChange}
                        className="bg-input border-border text-foreground uppercase"
                      />
                    </div>

                    {serverError && (
                      <p className="text-sm text-destructive text-center">{serverError}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                      disabled={
                        isLoading || !formData.email || !formData.password || !formData.username
                      }>
                      {isLoading ? (
                        <>
                          <Spinner className="size-5" /> Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>

                    <div className="relative my-4">
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
                      <Image
                        src="/google-color.svg"
                        width={500}
                        height={500}
                        alt="google logo"
                        className="size-5"
                      />
                      Sign up with Google
                    </Button>

                    <p>{authError}</p>
                  </div>

                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Link
                      href="/auth/login"
                      className="text-primary hover:underline underline-offset-4">
                      Sign in
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignUpForm />
    </Suspense>
  );
}
