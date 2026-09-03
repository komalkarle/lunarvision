import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mountain, Ruler, Sun } from "lucide-react";
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
      <section className="panel grid-backdrop relative overflow-hidden p-6 md:p-10">
        <p className="label-meta">Smart India Hackathon · Prototype</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-5xl">LunaMatch</h1>
        <p className="mt-2 text-base text-primary md:text-lg">
          Multi-Modal Lunar Image Correspondence &amp; Registration
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Lunar surface images acquired by different sensors rarely align. Chandrayaan-2 OHRC, TMC
          and IIRS products differ from reference datasets such as LRO NAC or SELENE in spectral
          response, spatial resolution, viewing geometry and solar illumination. LunaMatch explores
          a workflow that identifies corresponding physical locations across such multi-modal pairs
          and estimates the geometric transformation that brings them into alignment.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/registration">
              Open Image Registration <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/about">Read the approach</Link>
          </Button>
        </div>
        <p className="mt-6 max-w-3xl rounded-md border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
          Baseline mode uses a separate FastAPI service with SIFT, Lowe's ratio test, RANSAC and
          homography registration. Results are computed from the uploaded image pair.
        </p>
      </section>

      <Section
        title="Core Challenges"
        eyebrow="Problem space"
        description="Three invariances the matching pipeline must handle for reliable multi-modal correspondence."
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
        title="Processing Workflow"
        eyebrow="End to end"
        description="Stages executed for every source / reference pair submitted to the system."
      >
        <PipelineFlow steps={WORKFLOW} />
      </Section>
    </div>
  );
}
