import {Card} from "@/components/ui/card";

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({length: 8}).map((_, i) => (
        <Card key={i} className="h-12 animate-pulse bg-muted/40" />
      ))}
    </div>
  );
}
