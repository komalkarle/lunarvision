import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/luna/Section";

const TITLE = "About LunaMatch — Approach & Roadmap";
const DESC =
  "The problem of multi-modal lunar image matching, LunaMatch's proposed solution, prototype scope, planned technical stack and future enhancements.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const STACK = [
  "Python",
  "OpenCV",
  "SIFT / feature-based baseline",
  "RANSAC",
  "Homography / appropriate geometric transformation",
  "FastAPI backend",
  "React frontend",
  "NumPy",
  "PyTorch (future learned correspondence models)",
];

const FUTURE = [
  "Illumination-invariant feature extraction",
  "Scale-invariant correspondence",
  "Deep-learning-based multimodal matching",
  "Sub-pixel correspondence refinement",
  "Spatially uniform correspondence selection",
  "Support for OHRC, TMC, IIRS, LRO NAC and SELENE imagery",
];

function AboutPage() {
  return (
    <div className="space-y-6">
      <Section title="Problem" eyebrow="About LunaMatch">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Images of the Moon captured using different sensors, viewing geometries, Sun angles and
          spatial resolutions are difficult to match automatically. Shadow direction reverses
          between morning and evening passes, off-nadir geometry distorts terrain, and ground
          sampling distances differ by an order of magnitude between instruments — so conventional
          intensity-based matching fails on multi-modal lunar pairs.
        </p>
      </Section>

      <Section title="Proposed Solution" eyebrow="Approach">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          LunaMatch identifies corresponding physical locations between multi-modal lunar images and
          geometrically aligns them. Correspondences are established with invariant feature
          descriptors, filtered by robust geometric verification, and used to estimate the
          transformation that warps the source frame into the reference frame. Quality is reported
          through inlier statistics, residual error and spatial coverage.
        </p>
      </Section>

      <Section title="Current Prototype" eyebrow="Scope">
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          The current baseline demonstrates the complete registration workflow and evaluation interface. It
          uses a FastAPI service for real SIFT feature detection, RANSAC and
          warping is executed. Metrics shown on the Results page are labelled as prototype values
          and will be replaced by computed measurements once the processing backend is connected.
        </p>
      </Section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Planned Technical Implementation" eyebrow="Stack">
          <ul className="space-y-2">
            {STACK.map((item) => (
              <li
                key={item}
                className="rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs"
              >
                {item}
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Future Enhancements" eyebrow="Roadmap">
          <ul className="space-y-2">
            {FUTURE.map((item, i) => (
              <li key={item} className="flex gap-3 rounded-md border border-border bg-surface px-3 py-2 text-sm">
                <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}
