"use client";

import {Button} from "@/components/ui/button";
import {ArrowRight} from "lucide-react";
import dynamic from "next/dynamic";
import {Suspense} from "react";
const BackgroundVideo = dynamic(() => import("@/components/BgVideo"), {ssr: false});
export default function WhitepaperPage() {
  return (
    <section className="relative py-10 md:py-4 px-4 overflow-hidden flex items-center">
      {/* Video Background */}
      <Suspense fallback={null}>
        <BackgroundVideo />
      </Suspense>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Platform{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Whitepaper
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Learn about VerseEstate's vision, tokenomics, and roadmap to revolutionize digital asset
            mining
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 mb-12">
          <div className="p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-md hover:border-primary/30 transition-all hover:scale-105">
            <h3 className="text-xl font-bold text-foreground mb-2">Platform Overview</h3>
            <p className="text-muted-foreground">
              Discover how VerseEstate combines Web2 accessibility with Web3 technology to create a
              sustainable points mining ecosystem with real-world value.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-card/80 border border-border/50 backdrop-blur-md hover:border-primary/30 transition-all hover:scale-105">
            <h3 className="text-xl font-bold text-foreground mb-2">Tokenomics & Distribution</h3>
            <p className="text-muted-foreground">
              Learn about our fair distribution model, staking rewards, and how VersePoints convert
              to blockchain tokens in Phase 3.
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
  );
}
