import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

export function StatusButton({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: "green" | "yellow" | "red";
}) {
  const styles = {
    green: "bg-green-500/10 border-green-500/30 text-green-500",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-500",
    red: "bg-red-500/10 border-red-500/30 text-red-500",
  };

  return (
    <Button disabled variant="outline" className={cn("gap-2", styles[color])}>
      <Icon className="h-4 w-4" />
      {label}
    </Button>
  );
}
