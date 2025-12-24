"use client";

import type React from "react";

import Link from "next/link";
import dynamic from "next/dynamic";
import {Suspense, useState, useEffect} from "react";
import {Button} from "@/components/ui/button";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {
  Pickaxe,
  Users,
  Trophy,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  Gem,
  Rocket,
  ChevronRight,
  Sparkles,
  Star,
  Lock,
  CheckCircle2,
  Circle,
  Gift,
} from "lucide-react";
import {MINING_CONSTANTS} from "@/lib/constants";
import {formatNumberShort} from "@/lib/utils";

const HeroCrystal = dynamic(
  () => import("@/components/3d/hero-crystal").then((mod) => ({default: mod.HeroCrystal})),
  {ssr: false}
);
const ParticleWave = dynamic(
  () => import("@/components/3d/particle-wave").then((mod) => ({default: mod.ParticleWave})),
  {ssr: false}
);
const NFTShowcase3D = dynamic(
  () => import("@/components/3d/nft-showcase-3d").then((mod) => ({default: mod.NFTShowcase3D})),
  {ssr: false}
);
const RoadmapTunnel = dynamic(
  () => import("@/components/3d/roadmap-tunnel").then((mod) => ({default: mod.RoadmapTunnel})),
  {ssr: false}
);
const MiningCore = dynamic(
  () => import("@/components/3d/mining-core").then((mod) => ({default: mod.MiningCore})),
  {
    ssr: false,
  }
);
const FloatingParticles = dynamic(
  () =>
    import("@/components/3d/floating-particles").then((mod) => ({default: mod.FloatingParticles})),
  {ssr: false}
);
const NFTGrid3D = dynamic(
  () => import("@/components/3d/nft-grid-3d").then((mod) => ({default: mod.NFTGrid3D})),
  {
    ssr: false,
  }
);

// Animated counter component
function AnimatedCounter({value, duration = 2000}: {value: number; duration?: number}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <span>{count.toLocaleString()}</span>;
}

// NFT Preview Card
function NFTPreviewCard({
  name,
  tier,
  boost,
  color,
  icon: Icon,
}: {
  name: string;
  tier: string;
  boost: string;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <Card className="bg-card/50 border-border/50 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group hover:scale-105">
      <CardContent className="p-6">
        <div
          className="w-16 h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
          style={{backgroundColor: `${color}20`, boxShadow: `0 0 30px ${color}40`}}>
          <Icon className="w-8 h-8" style={{color}} />
        </div>
        <h4 className="font-semibold text-foreground mb-1">{name}</h4>
        <Badge variant="outline" className="mb-2" style={{borderColor: color, color}}>
          {tier}
        </Badge>
        <p className="text-sm text-primary font-medium">{boost}</p>
      </CardContent>
    </Card>
  );
}

// Phase item for roadmap
function PhaseItem({
  phase,
  title,
  description,
  isActive,
  isCurrent,
}: {
  phase: number;
  title: string;
  description: string;
  isActive: boolean;
  isCurrent: boolean;
}) {
  return (
    <div
      className={`flex gap-4 items-start p-4 rounded-xl transition-all duration-300 ${
        isCurrent
          ? "bg-primary/10 border border-primary/30"
          : isActive
          ? "bg-card/50"
          : "opacity-50"
      }`}>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isCurrent
            ? "bg-primary text-primary-foreground glow-primary"
            : isActive
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground"
        }`}>
        {isActive ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs text-muted-foreground">Phase {phase}</span>
          {isCurrent && <Badge className="bg-primary/20 text-primary text-xs">Current</Badge>}
        </div>
        <h4 className="font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const phases = [
    {
      phase: 1,
      title: "Foundation",
      description: "Core platform & Web2 mining",
      isActive: true,
      isCurrent: false,
    },
    {
      phase: 2,
      title: "NFT System",
      description: "Mining boosts & collectibles",
      isActive: true,
      isCurrent: true,
    },
    {
      phase: 3,
      title: "Governance",
      description: "Community voting & proposals",
      isActive: false,
      isCurrent: false,
    },
    {
      phase: 4,
      title: "Blockchain",
      description: "Token launch & DEX listing",
      isActive: false,
      isCurrent: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-md fixed top-0 w-full z-50 bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/50">
                <img
                  src="/logo.jpg"
                  alt="VerseEstate Logo"
                  width="auto"
                  height="auto"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                VerseEstate
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#features"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link
                href="#nfts"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                NFTs
              </Link>
              <Link
                href="#roadmap"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Roadmap
              </Link>
              <Link
                href="#whitepaper"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Whitepaper
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground glow-primary">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with 3D Crystal */}
      <section className="relative pt-32 pb-32 px-4 min-h-screen flex items-center">
        {/* 3D Background */}
        <Suspense fallback={null}>
          <HeroCrystal />
        </Suspense>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div
              className="text-center lg:text-left"
              style={{
                transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
              }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-8 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm text-primary font-medium">Phase 2 - NFT System Live</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance leading-tight">
                Mine{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent text-glow">
                  VersePoints
                </span>
                <br />
                <span className="text-4xl sm:text-5xl lg:text-6xl">Build Your Empire</span>
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-6 text-pretty">
                Start earning points through daily mining, collect powerful NFTs, and climb the
                ranks. Your journey to blockchain rewards starts here.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-2 mb-8 animate-pulse">
                <Gift className="w-6 h-6 text-primary" />
                <span className="text-lg font-bold text-primary">
                  {MINING_CONSTANTS.WELCOME_BONUS.toLocaleString()} VP Welcome Bonus!
                </span>
                <Sparkles className="w-5 h-5 text-accent animate-spin" />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
                <Link href="/auth/sign-up">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-lg px-8 py-6 glow-primary group">
                    Start Mining
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-8 py-6 bg-background/50 backdrop-blur-sm border-border/50">
                    Explore Features
                  </Button>
                </Link>
              </div>

              {/* Live Stats - Updated values */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                {[
                  {label: "Total Mined", value: 12, suffix: ".5M"},
                  {label: "Active Miners", value: 85, suffix: "K"},
                  {label: "NFTs Minted", value: 32, suffix: "K"},
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl bg-card/30 backdrop-blur-sm border border-border/30 hover:border-primary/30 transition-colors">
                    <div className="text-2xl font-bold text-primary">
                      <AnimatedCounter value={stat.value} />
                      {stat.suffix}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3D Mining Core */}
            <div className="relative h-125 hidden lg:block">
              <Suspense fallback={null}>
                <MiningCore />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-primary rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section with Particle Wave */}
      <section id="features" className="relative py-32 px-4">
        <Suspense fallback={null}>
          <ParticleWave />
        </Suspense>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">
              How It Works
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
              Simple. Powerful. <span className="text-primary">Rewarding.</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Three steps to start earning VersePoints and building your mining empire.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Pickaxe,
                title: "Daily Mining",
                description:
                  "Click the mine button once every 24 hours to earn VersePoints. Boost your earnings with NFTs.",
                color: "#06b6d4",
                stats: `${MINING_CONSTANTS.POINTS_PER_MINE}+ VP per mine`,
              },
              {
                icon: Users,
                title: "Referral Rewards",
                description:
                  "Share your unique link and earn bonus points when friends sign up and mine.",
                color: "#8b5cf6",
                stats: `+${MINING_CONSTANTS.REFERRAL_FIRST_MINING_BONUS} VP per referral`,
              },
              {
                icon: Trophy,
                title: "Rank Up",
                description:
                  "Climb from Rookie to Citizen, unlock exclusive perks and higher mining rates.",
                color: "#f59e0b",
                stats: "5 unique ranks",
              },
            ].map((feature, i) => (
              <Card
                key={feature.title}
                className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-500 group overflow-hidden hover:scale-105"
                style={{animationDelay: `${i * 100}ms`}}>
                <CardContent className="p-8 relative">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${feature.color}10 0%, transparent 70%)`,
                    }}
                  />
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{backgroundColor: `${feature.color}20`}}>
                    <feature.icon className="w-8 h-8" style={{color: feature.color}} />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground mb-4">{feature.description}</p>
                  <Badge
                    variant="outline"
                    style={{borderColor: feature.color, color: feature.color}}>
                    {feature.stats}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats Grid - Updated values */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {[
              {label: "Points Per Mine", value: `${MINING_CONSTANTS.POINTS_PER_MINE}+`, icon: Zap},
              {label: "Mining Interval", value: "24h", icon: Clock},
              {label: "Max NFT Boost", value: "100%", icon: Gem},
              {label: "Referral Levels", value: "3", icon: Users},
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-card/30 backdrop-blur-sm border border-border/30 text-center hover:border-primary/30 hover:scale-105 transition-all duration-300">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NFT Marketplace Section */}
      <section
        id="nfts"
        className="relative py-32 px-4 bg-gradient-to-b from-transparent via-card/20 to-transparent">
        <Suspense fallback={null}>
          <FloatingParticles color="#8b5cf6" count={1000} />
        </Suspense>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-accent/10 text-accent border-accent/30">
                NFT Marketplace
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
                Collect. Boost. <span className="text-accent">Dominate.</span>
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Acquire powerful NFTs that boost your mining rate. Combine 3 NFTs of the same tier
                in the Forge to create even more powerful collectibles.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <NFTPreviewCard
                  name="Cyber Pickaxe"
                  tier="Legendary"
                  boost="+50% Mining"
                  color="#f59e0b"
                  icon={Pickaxe}
                />
                <NFTPreviewCard
                  name="Quantum Core"
                  tier="Epic"
                  boost="+30% Mining"
                  color="#8b5cf6"
                  icon={Gem}
                />
                <NFTPreviewCard
                  name="Energy Crystal"
                  tier="Rare"
                  boost="+20% Mining"
                  color="#06b6d4"
                  icon={Sparkles}
                />
                <NFTPreviewCard
                  name="Star Fragment"
                  tier="Common"
                  boost="+10% Mining"
                  color="#6b7280"
                  icon={Star}
                />
              </div>

              <Link href="/dashboard/nfts">
                <Button className="bg-gradient-to-r from-accent to-primary hover:opacity-90 glow-accent group">
                  Browse Marketplace
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* 3D NFT Grid visualization */}
            <div className="relative h-[500px] lg:h-[600px]">
              <Suspense
                fallback={<div className="w-full h-full bg-muted/10 rounded-lg animate-pulse" />}>
                <NFTGrid3D />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap" className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/30">Roadmap</Badge>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4 text-balance">
              The Journey to <span className="text-primary">Web3</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Follow our 12-phase roadmap as we evolve from Web2 mining to a full blockchain
              ecosystem.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* 3D Roadmap Tunnel */}
            <div className="order-2 lg:order-1">
              <Suspense
                fallback={
                  <div className="h-[400px] flex items-center justify-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                }>
                <RoadmapTunnel currentPhase={2} />
              </Suspense>
            </div>

            {/* Phase List */}
            <div className="order-1 lg:order-2 space-y-4">
              {phases.map((phase) => (
                <PhaseItem key={phase.phase} {...phase} />
              ))}

              <Card className="bg-card/30 border-border/30 backdrop-blur-sm mt-6">
                <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">See All 12 Phases</h4>
                    <p className="text-sm text-muted-foreground">
                      View the complete roadmap and track progress
                    </p>
                  </div>
                  <Link href="/dashboard/phases">
                    <Button
                      variant="outline"
                      className="border-primary/30 text-primary hover:bg-primary/10 bg-transparent">
                      View Roadmap
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Whitepaper Section */}
      <section
        id="whitepaper"
        className="relative py-24 md:py-32 px-4 overflow-hidden min-h-screen flex items-center">
        {/* Video Background */}
        <div className="absolute inset-0 z-0">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/6bdd8c01-81a2-4190-9ff8-fdd50e8eae95-y6zHywbsjLf6vmtdFHaKszOW6rWX1v.MP4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Platform{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Whitepaper
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn about VerseEstate's vision, tokenomics, and roadmap to revolutionize digital
              asset mining
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-12">
            <div className="p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-md hover:border-primary/30 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-foreground mb-2">Platform Overview</h3>
              <p className="text-muted-foreground">
                Discover how VerseEstate combines Web2 accessibility with Web3 technology to create
                a sustainable points mining ecosystem with real-world value.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-md hover:border-primary/30 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-foreground mb-2">Tokenomics & Distribution</h3>
              <p className="text-muted-foreground">
                Learn about our fair distribution model, staking rewards, and how VersePoints
                convert to blockchain tokens in Phase 3.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-md hover:border-primary/30 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-foreground mb-2">12-Phase Roadmap</h3>
              <p className="text-muted-foreground">
                Explore our comprehensive roadmap from foundation to full blockchain integration and
                real estate tokenization.
              </p>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://docs.google.com/document/d/1N0pWRrpL0U76rUcmXr4YPZ6NpnyqUbgTXYCilUhBxAA/edit?usp=drivesdk"
              target="_blank"
              rel="noopener noreferrer">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground glow-primary">
                Read Full Whitepaper
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-16 md:py-32 px-4 bg-gradient-to-b from-transparent via-card/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-4 bg-success/10 text-success border-success/30">
                Security First
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
                Bank-Grade <span className="text-success">Protection</span>
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                We employ multiple layers of protection to ensure fair play and secure mining for
                all users.
              </p>
              <div className="space-y-4">
                {[
                  {
                    icon: Shield,
                    text: "Advanced anti-bot protection",
                    desc: "AI-powered fraud detection",
                  },
                  {
                    icon: Clock,
                    text: "Rate limiting & monitoring",
                    desc: "24/7 automated surveillance",
                  },
                  {icon: Zap, text: "Device fingerprinting", desc: "Multi-factor verification"},
                  {icon: Lock, text: "Row-level security", desc: "Supabase RLS policies"},
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card/30 border border-border/30 hover:border-success/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                      <item.icon className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <span className="font-medium text-foreground">{item.text}</span>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-success/10 to-primary/10 p-12 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1)_0%,transparent_70%)]" />
                <div className="w-40 h-40 rounded-full bg-success/10 flex items-center justify-center animate-pulse-glow relative">
                  <Shield className="w-20 h-20 text-success" />
                  <div className="absolute inset-0 rounded-full border-2 border-success/30 animate-ping" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative overflow-hidden">
        <Suspense fallback={null}>
          <FloatingParticles color="#06b6d4" count={500} />
        </Suspense>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl border border-border/50">
            <Rocket className="w-16 h-16 text-primary mx-auto mb-6 animate-bounce-slow" />
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 text-balance">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join thousands of miners earning VersePoints every day. Create your account, start
              mining, and build your path to blockchain rewards.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/sign-up">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground text-lg px-10 py-6 glow-primary group">
                  Create Free Account
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="text-lg px-10 py-6 bg-background/50">
                  Sign In
                </Button>
              </Link>
            </div>
            <p className="text-sm text-muted-foreground mt-6">
              No credit card required. Start mining in under 2 minutes.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/logo.jpg"
                  alt="VerseEstate"
                  width="auto"
                  height="auto"
                  className="w-10 h-10 rounded-xl object-cover"
                />
                <span className="text-xl font-bold text-foreground">VerseEstate</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                The next-generation Web2 to Web3 mining platform.
              </p>
              <div className="space-y-2 mb-4">
                <a
                  href="mailto:inquiry@verseestate.com"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  inquiry@verseestate.com
                </a>
                <a
                  href="mailto:support@verseestate.com"
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  support@verseestate.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Link href="https://t.me/VerseEstate001">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.094.036.308.02.475z" />
                    </svg>
                  </div>
                </Link>
                <Link href="https://youtube.com/@verseestate001?si=x4cHGhBypOZyW1W_">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                </Link>
                <Link href="https://www.tiktok.com/@verseestate5?_r=1&_t=ZS-926FGcRqut5">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.058 1.281-.073 1.689-.073 4.948 0 3.259.013 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.204-.013-3.583-.072-4.949-.196-4.354-2.617-6.78-6.979-6.98-1.281-.057-1.69-.069-4.949-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </Link>
                <Link href="https://discord.gg/2RtpUKYt">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                  </div>
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Platform</h4>
              <div className="space-y-2">
                <Link
                  href="/dashboard"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/nfts"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  NFT Marketplace
                </Link>
                <Link
                  href="/dashboard/leaderboard"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Leaderboard
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Resources</h4>
              <div className="space-y-2">
                <Link
                  href="/dashboard/phases"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Roadmap
                </Link>
                <Link
                  href="/dashboard/rank"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Ranking System
                </Link>
                <Link
                  href="/dashboard/tasks"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Tasks
                </Link>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <div className="space-y-2">
                <Link
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
                <Link
                  href="#"
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              2024 VersePoints. All rights reserved.
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 text-primary">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Phase 2 Active
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
