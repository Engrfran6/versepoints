"use client"

import type React from "react"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { loginSchema } from "@/lib/validations/auth"
import { Pickaxe, Eye, EyeOff } from "lucide-react"

const LoginTransition = dynamic(() => import("@/components/3d/login-transition").then((mod) => mod.LoginTransition), {
  ssr: false,
})
const FloatingParticles = dynamic(
  () => import("@/components/3d/floating-particles").then((mod) => mod.FloatingParticles),
  { ssr: false },
)
const MiningCore = dynamic(() => import("@/components/3d/mining-core").then((mod) => ({ default: mod.MiningCore })), {
  ssr: false,
})

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.errors[0]?.message || "Invalid input")
      setIsLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      const { data: userData } = await supabase.from("users").select("is_admin").eq("id", data.user.id).single()

      setIsTransitioning(true)
      setTimeout(() => {
        if (userData?.is_admin) {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }, 1500)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  if (isTransitioning) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="text-primary text-xl animate-pulse">Entering VersePoints...</div>
          </div>
        }
      >
        <LoginTransition />
      </Suspense>
    )
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
        <Suspense fallback={<div className="hidden lg:block w-80 h-80 bg-muted/10 rounded-full animate-pulse" />}>
          <div className="hidden lg:block w-80 h-80">
            <MiningCore />
          </div>
        </Suspense>

        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Pickaxe className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">VersePoints</span>
            </Link>

            <Card className="bg-card/90 backdrop-blur-sm border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-foreground">Welcome Back</CardTitle>
                <CardDescription className="text-muted-foreground">Sign in to continue mining</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
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
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    {error && <p className="text-sm text-destructive text-center">{error}</p>}
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  <div className="mt-6 text-center text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/sign-up" className="text-primary hover:underline underline-offset-4">
                      Sign up
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
