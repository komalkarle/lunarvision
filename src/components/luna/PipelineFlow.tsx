import { ArrowRight, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PipelineFlow({
  steps,
  orientation = "horizontal",
  activeIndex,
}: {
  steps: string[];
  orientation?: "horizontal" | "vertical";
  activeIndex?: number;
}) {
  const vertical = orientation === "vertical";
  return (
    <ol
      className={cn(
        "flex gap-2",
        vertical ? "flex-col items-stretch" : "flex-wrap items-center",
      )}
    >
      {steps.map((step, i) => {
        const active = activeIndex !== undefined && i <= activeIndex;
        return (
          <li key={step} className={cn("flex gap-2", vertical ? "flex-col" : "items-center")}>
            <div
              className={cn(
                "rounded-md border border-border bg-surface px-3 py-2 text-center text-xs font-medium md:text-sm",
                active && "border-primary/60 bg-primary/10 text-primary",
              )}
            >
              <span className="mr-2 font-mono text-[10px] text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {step}
            </div>
            {i < steps.length - 1 ? (
              vertical ? (
                <ArrowDown className="mx-auto size-4 text-muted-foreground" />
              ) : (
                <ArrowRight className="size-4 shrink-0 text-muted-foreground" />
              )
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
