import { useSyncExternalStore } from "react";

export type ImageSlot = {
  file: File;
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
  demo: false;
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
  registeredImageUrl: string;
  matchVisualizationUrl?: string;
  sourceKeypoints: number;
  referenceKeypoints: number;
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
  error: string | null;
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
  error: null,
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
    set({ [slot]: image, status: "idle", result: null, stageIndex: -1, error: null } as Partial<State>);
  },
  setSensor(slot: "source" | "reference", sensor: SensorId) {
    set(slot === "source" ? { sourceSensor: sensor } : { referenceSensor: sensor });
  },
  setStage(i: number) {
    set({ status: "running", stageIndex: i });
  },
  start() {
    set({ status: "running", stageIndex: 0, result: null, error: null });
  },
  complete(result: RegistrationResult) {
    set({ status: "done", stageIndex: PIPELINE_STAGES.length, result, error: null });
  },
  fail(message: string) {
    set({ status: "idle", stageIndex: -1, error: message });
  },
  reset() {
    set({
      source: null,
      reference: null,
      status: "idle",
      stageIndex: -1,
      result: null,
      error: null,
    });
  },
};

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
        file,
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

type ApiResponse = {
  success: boolean;
  error?: string;
  metrics: {
    source_keypoints: number;
    reference_keypoints: number;
    total_matches: number;
    inlier_matches: number;
    inlier_ratio: number;
    rmse: number | null;
    spatial_coverage: number;
    scale_ratio: number;
    rotation_deg: number;
    translation: [number, number];
  };
  matches: MatchPoint[];
  homography: number[][];
  registered_image: string;
  match_visualization: string;
};

export async function registerImages(source: ImageSlot, reference: ImageSlot): Promise<RegistrationResult> {
  const body = new FormData();
  body.append("source_image", source.file, source.name);
  body.append("reference_image", reference.file, reference.name);

  let response: Response;
  try {
    response = await fetch(import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/register", {
      method: "POST",
      body,
    });
  } catch {
    throw new Error("The registration backend is unavailable. Start the FastAPI service and try again.");
  }

  const payload = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.error ?? "Registration failed. Please check the images and try again.");
  }

  return {
    createdAt: Date.now(),
    demo: false,
    inlierMatches: payload.metrics.inlier_matches,
    totalMatches: payload.metrics.total_matches,
    inlierRatio: payload.metrics.inlier_ratio,
    rmse: payload.metrics.rmse ?? 0,
    coverage: payload.metrics.spatial_coverage,
    scaleRatio: payload.metrics.scale_ratio,
    rotationDeg: payload.metrics.rotation_deg,
    translation: payload.metrics.translation,
    matches: payload.matches,
    homography: payload.homography,
    registeredImageUrl: `data:image/png;base64,${payload.registered_image}`,
    matchVisualizationUrl: `data:image/png;base64,${payload.match_visualization}`,
    sourceKeypoints: payload.metrics.source_keypoints,
    referenceKeypoints: payload.metrics.reference_keypoints,
  };
}
