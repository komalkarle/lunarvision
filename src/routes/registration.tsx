import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Loader2, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/luna/Section";
import { UploadPanel } from "@/components/luna/UploadPanel";
import { actions, buildDemoResult, PIPELINE_STAGES, useLunaMatch } from "@/lib/lunamatch";
import { cn } from "@/lib/utils";

const TITLE = "Image Registration — LunaMatch";
const DESC =
  "Upload a Chandrayaan-2 source image (OHRC, TMC, IIRS) and a lunar reference image (LRO NAC, SELENE) and run the LunaMatch registration workflow.";

export const Route = createFileRoute("/registration")({
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
  component: RegistrationPage,
});

function RegistrationPage() {
  const state = useLunaMatch();
  const navigate = useNavigate();
  const [stage, setStage] = useState(-1);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const running = stage >= 0;
  const ready = Boolean(state.source && state.reference);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  function run() {
    if (!ready || running) return;
    actions.start();
    setStage(0);
    PIPELINE_STAGES.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStage(i), i * 550));
    });
    timers.current.push(
      setTimeout(() => {
        const result = buildDemoResult(`${state.source?.name}|${state.reference?.name}`);
        actions.complete(result);
        setStage(-1);
        void navigate({ to: "/results" });
      }, PIPELINE_STAGES.length * 550 + 400),
    );
  }

  function resetAll() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setStage(-1);
    actions.reset();
  }

  return (
    <div className="space-y-6">
      <Section
        title="Image Registration"
        eyebrow="Input"
        description="Provide one Chandrayaan-2 optical image and one reference lunar image. Both panels accept drag-and-drop or file selection."
        actions={
          <Button variant="outline" size="sm" onClick={resetAll} disabled={running}>
            <RotateCcw className="size-4" /> Reset
          </Button>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <UploadPanel
            slot="source"
            title="Source Image"
            subtitle="Chandrayaan-2"
            sensorLabel="Supported sensors"
            sensorOptions={["OHRC", "TMC", "IIRS"]}
            sensor={state.sourceSensor}
            image={state.source}
            disabled={running}
          />
          <UploadPanel
            slot="reference"
            title="Reference Image"
            subtitle="Lunar Reference"
            sensorLabel="Examples"
            sensorOptions={["LRO NAC", "SELENE", "OTHER"]}
            sensor={state.referenceSensor}
            image={state.reference}
            disabled={running}
          />
        </div>

        <div className="mt-5 space-y-3">
          <Button
            size="lg"
            className="h-14 w-full text-base font-semibold tracking-[0.12em]"
            disabled={!ready || running}
            onClick={run}
          >
            {running ? (
              <>
                <Loader2 className="size-5 animate-spin" /> PROCESSING…
              </>
            ) : (
              <>
                <Play className="size-5" /> REGISTER IMAGES
              </>
            )}
          </Button>
          {!ready ? (
            <p className="text-center text-xs text-muted-foreground">
              Both a source and a reference image are required before registration can start.
            </p>
          ) : null}
        </div>
      </Section>

      {running ? (
        <Section title="Processing" eyebrow="Pipeline execution">
          <ol className="space-y-2">
            {PIPELINE_STAGES.map((label, i) => {
              const done = i < stage;
              const active = i === stage;
              return (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-md border border-border bg-surface px-3 py-2.5 text-sm",
                    active && "border-primary/60 bg-primary/10",
                    !done && !active && "opacity-55",
                  )}
                >
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {done ? (
                    <CheckCircle2 className="size-4 text-success" />
                  ) : active ? (
                    <Loader2 className="size-4 animate-spin text-primary" />
                  ) : (
                    <span className="size-4 rounded-full border border-border" />
                  )}
                  <span className={cn(active && "text-primary")}>{label}</span>
                </li>
              );
            })}
          </ol>
        </Section>
      ) : null}
    </div>
  );
}
