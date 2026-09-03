import { useId } from "react";
import type { MatchPoint } from "@/lib/lunamatch";

/**
 * Side-by-side correspondence visualisation. Points and lines are derived from
 * the prototype match set, not from real feature detection.
 */
export function CorrespondenceView({
  sourceUrl,
  referenceUrl,
  matches,
  showOutliers,
}: {
  sourceUrl?: string;
  referenceUrl?: string;
  matches: MatchPoint[];
  showOutliers: boolean;
}) {
  const clipId = useId();
  const visible = showOutliers ? matches : matches.filter((m) => m.inlier);

  return (
    <div className="relative overflow-hidden rounded-md border border-border bg-black/40">
      <div className="grid grid-cols-2">
        <Pane url={sourceUrl} caption="Source" />
        <Pane url={referenceUrl} caption="Reference" />
      </div>
      <svg
        viewBox="0 0 200 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden="true"
        id={clipId}
      >
        {visible.map((m, i) => {
          const x1 = m.sx * 100;
          const y1 = m.sy * 100;
          const x2 = 100 + m.rx * 100;
          const y2 = m.ry * 100;
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={m.inlier ? "var(--color-primary)" : "var(--color-destructive)"}
                strokeWidth={0.25}
                strokeOpacity={m.inlier ? 0.55 : 0.7}
              />
              <circle
                cx={x1}
                cy={y1}
                r={0.7}
                fill={m.inlier ? "var(--color-primary)" : "var(--color-destructive)"}
              />
              <circle
                cx={x2}
                cy={y2}
                r={0.7}
                fill={m.inlier ? "var(--color-primary)" : "var(--color-destructive)"}
              />
            </g>
          );
        })}
        <line x1="100" y1="0" x2="100" y2="100" stroke="var(--color-border)" strokeWidth={0.4} />
      </svg>
    </div>
  );
}

function Pane({ url, caption }: { url?: string; caption: string }) {
  return (
    <div className="relative aspect-square">
      {url ? (
        <img src={url} alt={`${caption} image`} className="size-full object-cover" />
      ) : (
        <div className="grid-backdrop size-full bg-surface/60" />
      )}
      <span className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {caption}
      </span>
    </div>
  );
}
