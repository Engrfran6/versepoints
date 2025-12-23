"use client";

import {Suspense} from "react";
import AuthTransitionClient from "./AuthTransitionClient";

export default function AuthTransitionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
          <div className="text-primary text-xl animate-pulse">
            Entering VersePoints Eco-system...
          </div>
        </div>
      }>
      <AuthTransitionClient />
    </Suspense>
  );
}
