"use client";

import {useState} from "react";
import {createClient} from "@/lib/supabase/client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {ArrowLeft} from "lucide-react";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleReset = async () => {
    const supabase = createClient();
    const {error} = await supabase.auth.updateUser({password});

    if (!error) setSuccess(true);
  };

  if (success) {
    return <p className="text-center mt-10">Password updated. You can log in now.</p>;
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-6 bg-background overflow-hidden">
      <div className="w-full max-w-md">
        <div className="flex items-center">
          <ArrowLeft size={14} />
          <Button
            variant="link"
            onClick={() => router.back()}
            className="text-primary hover:underline hover:bg-transparent -ml-3">
            Go back
          </Button>
        </div>

        <Card className="bg-card/90 backdrop-blur-sm border-border">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-foreground">Reset Password</CardTitle>
            {/* <CardDescription className="text-muted-foreground">
            </CardDescription> */}
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="New password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input border-border text-foreground"
            />

            <Button onClick={handleReset} className="w-full">
              Reset password
            </Button>

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
  );
}
