import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {MailCheck, ArrowRight} from "lucide-react";
import Image from "next/image";

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Brand */}
          <Link href="/" className="flex items-center justify-center gap-2 mb-2">
            <span className="text-2xl font-bold text-foreground">VersePoints</span>
            <span className="text-sm text-muted-foreground">by</span>
            <Image
              src="/logo.jpg"
              width={36}
              height={36}
              alt="VerseEstate Logo"
              className="rounded-lg"
            />
          </Link>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MailCheck className="w-8 h-8 text-primary" />
              </div>

              <CardTitle className="text-2xl text-foreground">Verify your email</CardTitle>

              <CardDescription className="text-muted-foreground">
                We’ve sent a verification link to your inbox
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to activate your account and start mining VersePoints.
              </p>

              <p className="text-xs text-muted-foreground">
                Didn’t receive the email? Check your spam or promotions folder. Delivery can take up
                to a few minutes.
              </p>

              <div className="space-y-3 pt-2">
                <Link href="/auth/login" className="block">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Go to Login
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full">
                    Back to Home
                  </Button>
                </Link>
                Optional future enhancement:
                <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
                  Resend verification email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            VersePoints is powered by{" "}
            <span className="font-medium text-foreground">VerseEstate</span>
          </p>
        </div>
      </div>
    </div>
  );
}
