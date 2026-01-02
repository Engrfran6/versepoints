"use client";

import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {cn} from "@/lib/utils";

function Skeleton({className}: {className?: string}) {
  return <div className={cn("animate-pulse rounded-md bg-muted/30", className)} />;
}

export function RankSkeleton() {
  return (
    <div className="relative min-h-screen space-y-8 md:-mt-3">
      {/* Header */}
      <div className=" items-start space-y-4">
        <Skeleton className="h-5 w-48 md:w-2xl" />
        <Skeleton className="h-4 w-64 md:w-2xl" />
      </div>

      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-lg" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-10 w-full rounded-md" />
        </CardContent>
      </Card>
    </div>
  );
}
