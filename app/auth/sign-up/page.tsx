"use client";

import type React from "react";
import {Suspense, useState} from "react";
import dynamic from "next/dynamic";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import Image from "next/image";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";
import {signUpSchema, type SignUpInput} from "@/lib/validations/auth";
import {Pickaxe, Eye, EyeOff, CheckCircle2, XCircle} from "lucide-react";

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

  // Set referral code from URL if present
  useState(() => {
    if (refCode && !formData.referralCode) {
      setFormData((prev) => ({...prev, referralCode: refCode}));
    }
  });

  const passwordRequirements = [
    {test: (p: string) => p.length >= 8, label: "At least 8 characters"},
    {test: (p: string) => /[A-Z]/.test(p), label: "One uppercase letter"},
    {test: (p: string) => /[a-z]/.test(p), label: "One lowercase letter"},
    {test: (p: string) => /[0-9]/.test(p), label: "One number"},
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
    if (errors[name as keyof SignUpInput]) {
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
      const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof SignUpInput] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      let referrerId: string | null = null;
      if (formData.referralCode) {
        const {data: referrer} = await supabase
          .from("users")
          .select("id")
          .eq("referral_code", formData.referralCode.toUpperCase())
          .single();

        if (referrer) {
          referrerId = referrer.id;
        }
      }

      const {error} = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/dashboard`,
          data: {
            username: formData.username,
            referred_by: referrerId,
          },
        },
      });

      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setServerError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 bg-background overflow-hidden">
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
                      <div className="space-y-1 mt-2">
                        {passwordRequirements.map((req) => (
                          <div key={req.label} className="flex items-center gap-2 text-xs">
                            {req.test(formData.password) ? (
                              <CheckCircle2 className="w-3 h-3 text-green-500" />
                            ) : (
                              <XCircle className="w-3 h-3 text-muted-foreground" />
                            )}
                            <span
                              className={
                                req.test(formData.password)
                                  ? "text-green-500"
                                  : "text-muted-foreground"
                              }>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className=" grid gap-2">
                      <Label htmlFor="confirmPassword" className="text-foreground">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showPassword ? "text" : "password"}
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
                      disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
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
