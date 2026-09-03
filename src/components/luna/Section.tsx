import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  eyebrow,
  description,
  actions,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("panel overflow-hidden", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
        <div>
          {eyebrow ? <p className="label-meta">{eyebrow}</p> : null}
          <h2 className="text-base font-semibold md:text-lg">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions}
      </div>
      <div className={cn("p-4 md:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PrototypeTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent" />
      Prototype Result
    </span>
  );
}
