import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Crosshair, Download, Gauge, Grid3x3, Percent, RotateCcw, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Section } from "@/components/luna/Section";
import { MetricCard } from "@/components/luna/MetricCard";
import { CorrespondenceView } from "@/components/luna/CorrespondenceView";
import { PipelineFlow } from "@/components/luna/PipelineFlow";
import { actions, useLunaMatch } from "@/lib/lunamatch";

const TITLE = "Registration Results — LunaMatch";
const DESC =
  "Prototype registration metrics, feature correspondences, overlay comparison and match distribution for a multi-modal lunar image pair.";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResultsPage,
});

const PIPELINE = [
  "Source Image",
  "Preprocessing",
  "Feature Detection",
  "Feature Matching",
  "RANSAC Outlier Removal",
  "Geometric Transformation",
  "Registered Image",
];

function ResultsPage() {
  const state = useLunaMatch();
  const [opacity, setOpacity] = useState(55);
  const [showOutliers, setShowOutliers] = useState(false);
    const result = state.result;

  if (!result) {
    return (
      <Section title="No results yet" eyebrow="Results">
        <p className="text-sm text-muted-foreground">
          Run a registration from the Image Registration page to populate this view.
        </p>
        <Button asChild className="mt-4">
          <Link to="/registration">Go to Image Registration</Link>
        </Button>
      </Section>
    );
  }

  function download() {
    if (!result) return;
    const payload = {
        product: "LunaMatch SIFT baseline registration report",
        method: "SIFT + BFMatcher + Lowe ratio test + RANSAC homography",
      generatedAt: new Date(result.createdAt).toISOString(),
      source: state.source
        ? {
            filename: state.source.name,
            sensor: state.sourceSensor,
            width: state.source.width,
            height: state.source.height,
          }
        : null,
      reference: state.reference
        ? {
            filename: state.reference.name,
            sensor: state.referenceSensor,
            width: state.reference.width,
            height: state.reference.height,
          }
        : null,
      metrics: {
        inlierMatches: result.inlierMatches,
        totalMatches: result.totalMatches,
        inlierRatioPercent: Number(result.inlierRatio.toFixed(2)),
        rmsePx: Number(result.rmse.toFixed(3)),
        spatialCoveragePercent: Number(result.coverage.toFixed(1)),
        scaleRatio: Number(result.scaleRatio.toFixed(4)),
        rotationDeg: Number(result.rotationDeg.toFixed(3)),
        translationPx: result.translation.map((v) => Number(v.toFixed(2))),
      },
      homography: result.homography,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lunamatch-prototype-results.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <Section
        title="Registration Summary"
        eyebrow="Results"
          description={`${state.sourceSensor} source registered to ${state.referenceSensor} reference using the SIFT + RANSAC baseline.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-success/40 bg-success/10 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-success">
                Computed Result
              </span>
            <Button size="sm" variant="outline" onClick={download}>
              <Download className="size-4" /> Download Results
            </Button>
            <Button size="sm" variant="ghost" onClick={() => actions.reset()} asChild>
              <Link to="/registration">
                <RotateCcw className="size-4" /> New run
              </Link>
            </Button>
          </div>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Inlier Matches"
            value={String(result.inlierMatches)}
            icon={Target}
            hint={`of ${result.totalMatches} putative correspondences`}
          />
          <MetricCard
            label="Inlier Ratio"
            value={result.inlierRatio.toFixed(1)}
            unit="%"
            icon={Percent}
            progress={result.inlierRatio}
            hint="Survived RANSAC geometric verification"
          />
          <MetricCard
            label="Registration RMSE"
            value={result.rmse.toFixed(2)}
            unit="px"
            icon={Gauge}
            hint="Sub-pixel residual across inliers"
          />
          <MetricCard
            label="Spatial Coverage"
            value={result.coverage.toFixed(0)}
            unit="%"
            icon={Grid3x3}
            progress={result.coverage}
            hint="Image area containing verified matches"
          />
        </div>

        <dl className="mt-4 grid gap-4 rounded-md border border-border bg-surface p-4 font-mono text-xs sm:grid-cols-2">
          <div>
            <dt className="label-meta">Source keypoints</dt>
            <dd className="mt-1">{result.sourceKeypoints.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="label-meta">Reference keypoints</dt>
            <dd className="mt-1">{result.referenceKeypoints.toLocaleString()}</dd>
          </div>
        </dl>

        <dl className="mt-4 grid gap-4 rounded-md border border-border bg-surface p-4 font-mono text-xs sm:grid-cols-3">
          <div>
            <dt className="label-meta">Scale ratio</dt>
            <dd className="mt-1">{result.scaleRatio.toFixed(4)}×</dd>
          </div>
          <div>
            <dt className="label-meta">Rotation</dt>
            <dd className="mt-1">{result.rotationDeg.toFixed(2)}°</dd>
          </div>
          <div>
            <dt className="label-meta">Translation</dt>
            <dd className="mt-1">
              {result.translation[0].toFixed(1)}, {result.translation[1].toFixed(1)} px
            </dd>
          </div>
        </dl>
      </Section>

      <Section
        title="Feature Correspondences"
        eyebrow="Matching"
        description="Detected keypoints linked between the source and reference frames. Lines represent putative correspondences after ratio-test filtering."
        actions={
          <div className="flex items-center gap-2">
            <Switch id="outliers" checked={showOutliers} onCheckedChange={setShowOutliers} />
            <Label htmlFor="outliers" className="text-xs text-muted-foreground">
              Show rejected outliers
            </Label>
          </div>
        }
      >
        <CorrespondenceView
          sourceUrl={state.source?.url}
          referenceUrl={state.reference?.url}
          matches={result.matches}
          showOutliers={showOutliers}
        />
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <Legend color="var(--color-primary)" label="Inlier correspondence" />
          <Legend color="var(--color-destructive)" label="Rejected by RANSAC" />
        </div>
      </Section>

      <Section
        title="Registered Output"
        eyebrow="Alignment"
        description="Reference frame, warped source frame, and a blended overlay for visual verification."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <Frame url={state.reference?.url} caption="Reference Image" meta={state.referenceSensor} />
          <Frame url={result.registeredImageUrl} caption="Registered Source" meta={state.sourceSensor} />
          <div>
            <p className="label-meta mb-2">Overlay comparison</p>
            <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-black/40">
              {state.reference?.url ? (
                <img src={state.reference.url} alt="Reference frame" className="absolute inset-0 size-full object-cover" />
              ) : (
                <div className="grid-backdrop absolute inset-0" />
              )}
              {result.registeredImageUrl ? (
                <img
                  src={result.registeredImageUrl}
                  alt="Registered source frame overlay"
                  className="absolute inset-0 size-full object-cover"
                  style={{
                    opacity: opacity / 100,
                    transform: `rotate(${result.rotationDeg}deg) scale(${result.scaleRatio})`,
                  }}
                />
              ) : null}
              <Crosshair className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 text-primary/70" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="label-meta shrink-0">Opacity</span>
              <Slider
                value={[opacity]}
                onValueChange={(v) => setOpacity(v[0] ?? 0)}
                max={100}
                step={1}
                aria-label="Overlay opacity"
              />
              <span className="w-10 shrink-0 text-right font-mono text-xs">{opacity}%</span>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <DownloadButton url={result.registeredImageUrl} filename="lunamatch-registered.png" label="Download Registered Image" />
          {result.matchVisualizationUrl ? (
            <DownloadButton url={result.matchVisualizationUrl} filename="lunamatch-matches.png" label="Download Match Visualization" />
          ) : null}
        </div>
      </Section>

      <Section
        title="Match Distribution"
        eyebrow="Spatial quality"
        description="Correspondence density per image cell. A uniform spread indicates matches are not concentrated in a single region."
      >
        <DistributionGrid matches={result.matches} />
      </Section>

      <Section title="Registration Pipeline" eyebrow="Executed stages">
        <PipelineFlow steps={PIPELINE} orientation="vertical" activeIndex={PIPELINE.length - 1} />
      </Section>
    </div>
  );
}

function DownloadButton({ url, filename, label }: { url: string; filename: string; label: string }) {
  return (
    <Button size="sm" variant="outline" asChild>
      <a href={url} download={filename}>
        <Download className="size-4" /> {label}
      </a>
    </Button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}

function Frame({
  url,
  caption,
  meta,
  warped,
}: {
  url?: string;
  caption: string;
  meta: string;
  warped?: boolean;
}) {
  return (
    <div>
      <p className="label-meta mb-2">{caption}</p>
      <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-black/40">
        {url ? (
          <img
            src={url}
            alt={caption}
            className="size-full object-cover"
            style={warped ? { transform: "scale(1.02)" } : undefined}
          />
        ) : (
          <div className="grid-backdrop size-full" />
        )}
        <span className="absolute bottom-2 left-2 rounded bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {meta}
        </span>
      </div>
    </div>
  );
}

function DistributionGrid({ matches }: { matches: { sx: number; sy: number; inlier: boolean }[] }) {
  const cols = 8;
  const rows = 6;
  const cells = Array.from({ length: cols * rows }, () => 0);
  matches
    .filter((m) => m.inlier)
    .forEach((m) => {
      const cx = Math.min(cols - 1, Math.floor(m.sx * cols));
      const cy = Math.min(rows - 1, Math.floor(m.sy * rows));
      cells[cy * cols + cx] += 1;
    });
  const max = Math.max(1, ...cells);
  const occupied = cells.filter((c) => c > 0).length;

  return (
    <div className="space-y-3">
      <div
        className="grid gap-1 rounded-md border border-border bg-surface p-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {cells.map((count, i) => (
          <div
            key={i}
            title={`${count} inlier${count === 1 ? "" : "s"}`}
            className="aspect-square rounded-sm border border-border/60"
            style={{ backgroundColor: `color-mix(in oklch, var(--color-primary) ${(count / max) * 85 + (count ? 15 : 0)}%, transparent)` }}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {occupied} of {cols * rows} grid cells contain verified correspondences · peak density {max}{" "}
        matches per cell.
      </p>
    </div>
  );
}
