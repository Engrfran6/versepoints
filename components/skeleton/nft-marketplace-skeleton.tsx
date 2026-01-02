import {Card} from "@/components/ui/card";

export function NFTMarketplaceSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="h-8 w-40 animate-pulse bg-muted/40" />

      <div className="grid grid-cols-2 gap-4">
        {Array.from({length: 6}).map((_, i) => (
          <Card key={i} className="h-32 animate-pulse bg-muted/40" />
        ))}
      </div>
    </div>
  );
}
