import { useSyncExternalStore } from "react";

export type ImageSlot = {
  name: string;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  type: string;
};

export type MatchPoint = {
  sx: number; // 0..1 in source image space
  sy: number;
  rx: number; // 0..1 in reference image space
  ry: number;
  inlier: boolean;
};

export type RegistrationResult = {
  createdAt: number;
  demo: true;
  inlierMatches: number;
  totalMatches: number;
  inlierRatio: number; // percent
  rmse: number; // px
  coverage: number; // percent
  scaleRatio: number;
  rotationDeg: number;
  translation: [number, number];
  matches: MatchPoint[];
  homography: number[][];
};

export type SensorId = "OHRC" | "TMC" | "IIRS" | "LRO NAC" | "SELENE" | "OTHER";

type State = {
  source: ImageSlot | null;
  reference: ImageSlot | null;
  sourceSensor: SensorId;
  referenceSensor: SensorId;
  status: "idle" | "running" | "done";
  stageIndex: number;
  result: RegistrationResult | null;
};

export const PIPELINE_STAGES = [
  "Loading images",
  "Preprocessing",
  "Detecting features",
  "Finding correspondences",
  "Removing outliers",
  "Estimating geometric transformation",
  "Generating registered image",
  "Calculating quality metrics",
] as const;

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/tiff", "image/bmp"];
export const MAX_BYTES = 25 * 1024 * 1024;

let state: State = {
  source: null,
  reference: null,
  sourceSensor: "OHRC",
  referenceSensor: "LRO NAC",
  status: "idle",
  stageIndex: -1,
  result: null,
};

const listeners = new Set<() => void>();

function set(patch: Partial<State>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useLunaMatch() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => state,
  );
}

export const actions = {
  setImage(slot: "source" | "reference", image: ImageSlot | null) {
    set({ [slot]: image, status: "idle", result: null, stageIndex: -1 } as Partial<State>);
  },
  setSensor(slot: "source" | "reference", sensor: SensorId) {
    set(slot === "source" ? { sourceSensor: sensor } : { referenceSensor: sensor });
  },
  setStage(i: number) {
    set({ status: "running", stageIndex: i });
  },
  start() {
    set({ status: "running", stageIndex: 0, result: null });
  },
  complete(result: RegistrationResult) {
    set({ status: "done", stageIndex: PIPELINE_STAGES.length, result });
  },
  reset() {
    set({
      source: null,
      reference: null,
      status: "idle",
      stageIndex: -1,
      result: null,
    });
  },
};

/** Deterministic pseudo-random generator so demo results are reproducible. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Builds a plausible, clearly-labelled prototype result set. */
export function buildDemoResult(seedText: string): RegistrationResult {
  let seed = 7;
  for (let i = 0; i < seedText.length; i++) seed = (seed * 31 + seedText.charCodeAt(i)) | 0;
  const rnd = mulberry32(seed);

  const inlierMatches = 231 + Math.floor(rnd() * 45);
  const inlierRatio = 88.5 + rnd() * 5.5;
  const totalMatches = Math.round(inlierMatches / (inlierRatio / 100));
  const rmse = 0.62 + rnd() * 0.4;
  const coverage = 82 + rnd() * 10;
  const scaleRatio = 0.94 + rnd() * 0.14;
  const rotationDeg = (rnd() - 0.5) * 7;
  const tx = (rnd() - 0.5) * 60;
  const ty = (rnd() - 0.5) * 60;

  const matches: MatchPoint[] = [];
  const count = 60;
  const rad = (rotationDeg * Math.PI) / 180;
  for (let i = 0; i < count; i++) {
    // stratified sampling over a 6x5 grid keeps points spatially spread
    const gx = i % 6;
    const gy = Math.floor(i / 6) % 5;
    const sx = (gx + 0.15 + rnd() * 0.7) / 6;
    const sy = (gy + 0.15 + rnd() * 0.7) / 5;
    const inlier = rnd() < inlierRatio / 100;
    const cx = sx - 0.5;
    const cy = sy - 0.5;
    let rx = 0.5 + (cx * Math.cos(rad) - cy * Math.sin(rad)) * scaleRatio + tx / 1200;
    let ry = 0.5 + (cx * Math.sin(rad) + cy * Math.cos(rad)) * scaleRatio + ty / 1200;
    if (!inlier) {
      rx += (rnd() - 0.5) * 0.4;
      ry += (rnd() - 0.5) * 0.4;
    }
    matches.push({
      sx,
      sy,
      rx: Math.min(0.97, Math.max(0.03, rx)),
      ry: Math.min(0.97, Math.max(0.03, ry)),
      inlier,
    });
  }

  const homography = [
    [scaleRatio * Math.cos(rad), -Math.sin(rad) * scaleRatio, tx],
    [Math.sin(rad) * scaleRatio, scaleRatio * Math.cos(rad), ty],
    [0.0000021, -0.0000014, 1],
  ];

  return {
    createdAt: Date.now(),
    demo: true,
    inlierMatches,
    totalMatches,
    inlierRatio,
    rmse,
    coverage,
    scaleRatio,
    rotationDeg,
    translation: [tx, ty],
    matches,
    homography,
  };
}

export function readImageFile(file: File): Promise<ImageSlot> {
  return new Promise((resolve, reject) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      reject(new Error(`Unsupported file type "${file.type || file.name}". Use PNG, JPEG, WEBP, TIFF or BMP.`));
      return;
    }
    if (file.size > MAX_BYTES) {
      reject(new Error("File exceeds the 25 MB prototype limit."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () =>
      resolve({
        name: file.name,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        sizeBytes: file.size,
        type: file.type,
      });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("The image could not be decoded by the browser (TIFF preview may be unsupported)."));
    };
    img.src = url;
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
