import {Card, CardContent} from "@/components/ui/card";

export function TaskCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="h-11 w-11 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
            <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-20 bg-muted rounded-full animate-pulse" />
              <div className="h-4 w-16 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <div className="hidden sm:block h-9 w-28 bg-muted rounded animate-pulse" />
        </div>
      </CardContent>
    </Card>
  );
}
