import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Crosshair,
  Database,
  Mountain,
  Ruler,
  ScanSearch,
  Sun,
} from "lucide-react";
import { Section } from "@/components/luna/Section";
import { PipelineFlow } from "@/components/luna/PipelineFlow";
import { Button } from "@/components/ui/button";

const TITLE = "LunaMatch — Multi-Modal Lunar Image Correspondence & Registration";
const DESC =
  "Prototype workflow for Sun-angle and scale invariant correspondence between Chandrayaan-2 optical imagery and reference lunar datasets such as LRO NAC and SELENE.";

export const Route = createFileRoute("/")({
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
  component: Dashboard,
});

const CHALLENGES = [
  {
    icon: Sun,
    title: "Illumination Variation",
    body: "Different Sun elevation and azimuth angles invert shadows and change crater appearance, breaking intensity-based similarity measures.",
    tag: "Sun angle",
  },
  {
    icon: Mountain,
    title: "Viewpoint Variation",
    body: "Off-nadir acquisition geometry introduces perspective distortion and parallax over rugged highland terrain.",
    tag: "Geometry",
  },
  {
    icon: Ruler,
    title: "Scale Variation",
    body: "Ground sampling distance ranges from sub-metre OHRC frames to tens of metres for TMC and reference mosaics.",
    tag: "Resolution",
  },
];

const WORKFLOW = [
  "Input Images",
  "Preprocessing",
  "Feature Detection",
  "Correspondence Matching",
  "Geometric Verification",
  "Registration",
  "Evaluation",
];

function Dashboard() {
  return (
    <div className="space-y-6">
      <section className="panel overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_1.35fr]">
          <div className="grid-backdrop flex flex-col justify-between border-b border-border p-6 md:p-8 lg:border-b-0 lg:border-r">
            <div>
              <div className="flex items-center gap-2 text-success">
                <span className="size-2 rounded-full bg-success shadow-[0_0_12px_var(--color-success)]" />
                <span className="label-meta text-success">Baseline engine ready</span>
              </div>
              <p className="label-meta mt-8">Smart India Hackathon · Mission console</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-6xl">LunaMatch</h1>
              <p className="mt-3 max-w-md text-base leading-relaxed text-primary">
                Find the same lunar terrain across different sensors, then register it precisely.
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                Upload a Chandrayaan-2 frame and a matching lunar reference image to run the SIFT +
                RANSAC correspondence baseline.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/registration">
                  Start a registration <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/about">View method</Link>
              </Button>
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="label-meta">Demo pair · same terrain</p>
                <h2 className="mt-1 text-lg font-semibold">Correspondence preview</h2>
              </div>
              <Crosshair className="size-5 text-primary" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <ImagePreview src="/sample-lunar-source.png" label="SOURCE" sensor="OHRC" />
              <ImagePreview src="/sample-lunar-reference.png" label="REFERENCE" sensor="LRO NAC" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <Readout icon={ScanSearch} label="Detector" value="SIFT" />
              <Readout icon={Activity} label="Matcher" value="RANSAC" />
              <Readout icon={Database} label="Output" value="H-map" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
        <Section
          title="Run sequence"
          eyebrow="Live pipeline"
          description="Every stage is executed against your uploaded image pair."
        >
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              "Images loaded",
              "Intensity normalized",
              "Features detected",
              "Matches filtered",
              "Outliers removed",
              "Registration evaluated",
            ].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-3">
                <CheckCircle2 className="size-4 shrink-0 text-success" />
                <span className="text-sm">{step}</span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Input pair" eyebrow="Ready to compare">
          <div className="space-y-3">
            <StatusRow label="Source sensor" value="OHRC / TMC / IIRS" />
            <StatusRow label="Reference sensor" value="LRO NAC / SELENE" />
            <StatusRow label="Transformation" value="Homography" />
            <div className="mt-4 rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs leading-relaxed text-accent">
              Try the included sample pair on the registration page to see the complete flow.
            </div>
          </div>
        </Section>
      </section>

      <Section
        title="What the baseline handles"
        eyebrow="Problem space"
        description="The same conditions that make lunar imagery difficult to compare."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {CHALLENGES.map((c) => (
            <article key={c.title} className="rounded-md border border-border bg-surface p-4">
              <div className="flex items-center justify-between">
                <c.icon className="size-5 text-primary" />
                <span className="label-meta">{c.tag}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold md:text-base">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section
        title="Processing architecture"
        eyebrow="Expandable baseline"
        description="A modular foundation for future learned correspondence models."
      >
        <PipelineFlow steps={WORKFLOW} />
      </Section>
    </div>
  );
}

function ImagePreview({ src, label, sensor }: { src: string; label: string; sensor: string }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-black/50">
      <img src={src} alt={`${label} sample lunar image`} className="size-full object-cover grayscale" />
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-background/85 px-3 py-2">
        <span className="font-mono text-[10px] tracking-widest text-primary">{label}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{sensor}</span>
      </div>
    </div>
  );
}

function Readout({ icon: Icon, label, value }: { icon: typeof ScanSearch; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface p-3">
      <Icon className="size-4 text-primary" />
      <p className="label-meta mt-3">{label}</p>
      <p className="mt-1 font-mono text-xs text-foreground">{value}</p>
    </div>
  );
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-3 text-sm last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}
