"use client";

import {useEffect, useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft, Eye, EyeOff, CheckCircle2, XCircle} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const guard = async () => {
      const supabase = createClient();
      const {data} = await supabase.auth.getSession();

      const session = data.session;

      // ❌ No session → block
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      // ❌ Logged-in user trying to access reset page
      if (!session.user.recovery_sent_at) {
        router.replace("/dashboard");
        return;
      }
    };

    guard();
  }, [router]);

  /* ---------------- Password Rules ------------------- */
  const passwordRules = [
    {label: "At least 8 characters", valid: password.length >= 8},
    {label: "One uppercase letter", valid: /[A-Z]/.test(password)},
    {label: "One lowercase letter", valid: /[a-z]/.test(password)},
    {label: "One number", valid: /[0-9]/.test(password)},
  ];

  /* ---------------- Submit Handler ------------------- */
  const handleReset = async () => {
    setError(null);

    if (!passwordRules.every((r) => r.valid)) {
      setError("Password does not meet requirements");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const {error} = await supabase.auth.updateUser({password});

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);

    await supabase.auth.signOut();

    // Redirect after success
    setTimeout(() => {
      router.replace("/auth/login");
    }, 2000);
  };

  /* ---------------- Success Screen ------------------- */
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-xl text-center bg-transparent p-6">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-green-500" />
          <h2 className="text-xl font-semibold">Password Updated</h2>
          <p className="mt-2 text-sm text-muted-foreground">Redirecting you to login…</p>
        </Card>
      </div>
    );
  }

  /* ---------------- Main UI ------------------- */
  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex items-center mb-4">
          <ArrowLeft size={14} />
          <Button variant="link" onClick={() => router.back()} className="text-primary -ml-3">
            Go back
          </Button>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Reset Password</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password rules */}
            <div className="space-y-1 text-xs">
              {passwordRules.map((rule) => (
                <div key={rule.label} className="flex items-center gap-2">
                  {rule.valid ? (
                    <CheckCircle2 className="h-3 w-3 text-green-500" />
                  ) : (
                    <XCircle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={rule.valid ? "text-green-500" : "text-muted-foreground"}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}

            <Button onClick={handleReset} disabled={loading} className="w-full">
              {loading ? "Updating..." : "Reset password"}
            </Button>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link href="/auth/sign-up" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
