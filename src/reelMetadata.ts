import { getStaticFiles, staticFile, type CalculateMetadataFunction } from "remotion";
import { estimateTiming, hashScript, validateReel } from "./lib/timing.ts";
import { FPS } from "./theme.ts";
import type { Reel, ReelProps, Timing } from "./types.ts";

/**
 * ¿Existe este archivo de public/? En Studio se consulta la lista de archivos (sin ruido en consola);
 * en el render se hace un pedido HEAD (el servidor responde HTML a rutas inexistentes).
 */
const exists = async (path: string, signal: AbortSignal): Promise<boolean> => {
  const listed = typeof window !== "undefined" ? (window.remotion_staticFiles ?? []) : [];
  if (listed.length > 0 && !window.remotion_isPlayer) return getStaticFiles().some((f) => f.name === path);
  try {
    const res = await fetch(staticFile(path), { method: "HEAD", signal });
    const type = res.headers.get("content-type") ?? "";
    return res.ok && !type.includes("text/html");
  } catch {
    return false;
  }
};

const loadTiming = async (id: string, signal: AbortSignal): Promise<Timing | null> => {
  const file = `reels/${id}/timing.json`;
  if (!(await exists(file, signal))) return null;
  try {
    const res = await fetch(staticFile(file), { signal, cache: "no-store" });
    return res.ok ? ((await res.json()) as Timing) : null;
  } catch {
    return null;
  }
};

/**
 * Decide la duración y los tiempos de cada escena:
 * - con tu voz grabada y procesada (npm run voz) -> tiempos reales del audio;
 * - sin voz -> tiempos estimados, para poder previsualizar el reel mientras lo armás.
 */
export const calculateReelMetadata: CalculateMetadataFunction<ReelProps> = async ({ props, abortSignal }) => {
  const reel: Reel = props.reel;
  validateReel(reel);

  const saved = await loadTiming(reel.id, abortSignal);
  if (saved && saved.scriptHash !== hashScript(reel)) {
    throw new Error(
      `Cambiaste el texto (vo) de "${reel.id}" después de procesar la voz. Volvé a correr: npm run voz -- ${reel.id}`,
    );
  }
  const timing = saved ?? estimateTiming(reel);

  const assets: Record<string, boolean> = {};
  const paths = [
    ...reel.scenes.flatMap((s) => {
      if (s.type === "image" || s.type === "clip") return [s.src];
      if (s.type === "broll") return s.clips.map((c) => c.src);
      return [];
    }),
    ...(reel.music ? [reel.music.src] : []),
    ...(timing.audioFile ? [timing.audioFile] : []),
  ];
  await Promise.all(
    paths.map(async (p) => {
      assets[p] = await exists(p, abortSignal);
    }),
  );

  return {
    durationInFrames: Math.max(1, Math.ceil((timing.durationMs / 1000) * FPS)),
    props: { reel, timing, assets },
  };
};
