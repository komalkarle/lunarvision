import { useRef, useState } from "react";
import { AlertCircle, ImageUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  actions,
  formatBytes,
  readImageFile,
  type ImageSlot,
  type SensorId,
} from "@/lib/lunamatch";
import { cn } from "@/lib/utils";

export function UploadPanel({
  slot,
  title,
  subtitle,
  sensorLabel,
  sensorOptions,
  sensor,
  image,
  disabled,
}: {
  slot: "source" | "reference";
  title: string;
  subtitle: string;
  sensorLabel: string;
  sensorOptions: SensorId[];
  sensor: SensorId;
  image: ImageSlot | null;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const parsed = await readImageFile(file);
      actions.setImage(slot, parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read that file.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="panel flex flex-col overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="label-meta mt-0.5">{subtitle}</p>
        </div>
        <span className="rounded border border-border bg-surface px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-primary">
          {sensor}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        {image ? (
          <div className="space-y-3">
            <div className="relative overflow-hidden rounded-md border border-border bg-black/40">
              <img
                src={image.url}
                alt={`${title} preview — ${image.name}`}
                className="h-64 w-full object-contain"
              />
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="absolute right-2 top-2 size-8"
                onClick={() => actions.setImage(slot, null)}
                aria-label={`Remove ${title}`}
                disabled={disabled}
              >
                <X className="size-4" />
              </Button>
            </div>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-xs">
              <Meta label="File" value={image.name} truncate />
              <Meta label="Dimensions" value={`${image.width} × ${image.height} px`} />
              <Meta label="Size" value={formatBytes(image.sizeBytes)} />
              <Meta label="Source" value={sensor} />
            </dl>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              void handleFile(e.dataTransfer.files?.[0]);
            }}
            disabled={disabled || loading}
            className={cn(
              "grid-backdrop flex h-64 w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-surface/50 px-6 text-center transition-colors",
              dragging && "border-primary bg-primary/5",
              disabled && "opacity-60",
            )}
          >
            {loading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <ImageUp className="size-6 text-primary" />
            )}
            <span className="text-sm font-medium">
              {loading ? "Reading image…" : "Drag & drop image here"}
            </span>
            <span className="text-xs text-muted-foreground">
              or click to browse · PNG, JPEG, WEBP, TIFF, BMP · max 25 MB
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            void handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {error ? (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
            {error}
          </p>
        ) : null}

        <div className="mt-auto space-y-2 border-t border-border pt-3">
          <p className="label-meta">{sensorLabel}</p>
          <div className="flex flex-wrap gap-2">
            {sensorOptions.map((option) => (
              <button
                key={option}
                type="button"
                disabled={disabled}
                onClick={() => actions.setSensor(slot, option)}
                className={cn(
                  "rounded border border-border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground",
                  sensor === option && "border-primary/60 bg-primary/10 text-primary",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Meta({ label, value, truncate }: { label: string; value: string; truncate?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="label-meta">{label}</dt>
      <dd className={cn("mt-0.5 text-foreground", truncate && "truncate")} title={value}>
        {value}
      </dd>
    </div>
  );
}
