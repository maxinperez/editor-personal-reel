// Los imports llevan extensión .ts para que Node los pueda ejecutar directo desde scripts/.
import { alignScript, type Heard } from "./align.ts";
import type { Reel, Timing, Word } from "../types.ts";
import { splitEmphasis } from "./text.ts";

/** Palabras de lo que se dice, sin los asteriscos de énfasis, indicando cuáles van resaltadas. */
export const parseVo = (vo: string): { text: string; em: boolean }[] =>
  splitEmphasis(vo).map((w) => ({ text: w.word, em: w.em }));

export const scriptWords = (vo: string): string[] => parseVo(vo).map((w) => w.text);

/** Huella simple del texto hablado. Detecta cuándo timing.json quedó desactualizado. */
export const hashScript = (reel: Reel): string => {
  const text = reel.scenes.map((s) => s.vo.trim()).join("\n");
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h * 33) ^ text.charCodeAt(i)) >>> 0;
  return h.toString(36);
};

export const validateReel = (reel: Reel): void => {
  if (!reel.scenes.length) throw new Error(`El reel "${reel.id}" no tiene escenas.`);
  reel.scenes.forEach((s, i) => {
    if (!scriptWords(s.vo).length) {
      throw new Error(
        `La escena ${i + 1} (${s.type}) del reel "${reel.id}" no tiene texto en "vo". ` +
          `Cada escena necesita lo que se dice mientras está en pantalla.`,
      );
    }
  });
};

/** Palabras del guion en orden, cada una marcada con el número de escena al que pertenece. */
const flatten = (reel: Reel) =>
  reel.scenes.flatMap((s, scene) => parseVo(s.vo).map((w) => ({ text: w.text, em: w.em, scene })));

/** Arma los límites de cada escena a partir de cuándo se dice su primera palabra. */
const buildScenes = (
  reel: Reel,
  flat: { scene: number }[],
  times: { startMs: number; endMs: number }[],
  durationMs: number,
): Timing["scenes"] => {
  const firstStart: number[] = [];
  flat.forEach((w, idx) => {
    if (firstStart[w.scene] === undefined) firstStart[w.scene] = times[idx].startMs;
  });
  const starts = reel.scenes.map((_, i) => {
    if (i === 0) return 0;
    // Siempre creciente, aunque el reconocimiento de voz tenga ruido.
    return Math.max(firstStart[i], 0);
  });
  for (let i = 1; i < starts.length; i++) starts[i] = Math.max(starts[i], starts[i - 1] + 300);
  return starts.map((startMs, i) => ({
    startMs,
    endMs: i < starts.length - 1 ? starts[i + 1] : durationMs,
  }));
};

/**
 * Tiempos estimados (por defecto ~2,7 palabras por segundo; ajustable con `wordsPerSecond`)
 * para ver el reel en Studio antes de grabar la voz.
 */
export const estimateTiming = (reel: Reel): Timing => {
  validateReel(reel);
  const flat = flatten(reel);
  const words: Word[] = [];
  const wordMs = 1000 / (reel.wordsPerSecond ?? 2.7);
  let t = 250;
  for (const w of flat) {
    const dur = wordMs + Math.max(0, w.text.length - 6) * 25;
    words.push({ text: w.text, startMs: t, endMs: t + dur, em: w.em });
    t += dur;
    if (/[.!?…]$/.test(w.text)) t += 300;
    else if (/[,;:]$/.test(w.text)) t += 120;
  }
  const durationMs = words[words.length - 1].endMs + 900;
  return {
    source: "estimado",
    scriptHash: hashScript(reel),
    durationMs,
    words,
    scenes: buildScenes(reel, flat, words, durationMs),
  };
};

/**
 * Cruza el guion con lo que Whisper escuchó para calcular cuándo empieza cada escena
 * y cuándo se dice cada palabra.
 */
export const timingFromHeard = (
  reel: Reel,
  heard: Heard[],
  opts: { audioMs?: number; audioFile?: string; captionsFrom?: "guion" | "voz" } = {},
): Timing => {
  validateReel(reel);
  if (!heard.length) throw new Error("Whisper no detectó palabras en el audio.");

  const flat = flatten(reel);
  const aligned = alignScript(
    flat.map((w) => w.text),
    heard,
  );
  const lastEnd = Math.max(...aligned.map((a) => a.endMs));
  const durationMs = opts.audioMs ? Math.round(Math.min(opts.audioMs, lastEnd + 1200)) : Math.round(lastEnd + 800);
  const finalDuration = Math.max(durationMs, lastEnd + 300);

  const words: Word[] =
    (opts.captionsFrom ?? reel.captionsFrom ?? "guion") === "voz"
      ? heard.map((h) => ({ text: h.text, startMs: h.startMs, endMs: h.endMs }))
      : flat.map((w, i) => ({ text: w.text, startMs: aligned[i].startMs, endMs: aligned[i].endMs, em: w.em }));

  return {
    source: "audio",
    audioFile: opts.audioFile,
    scriptHash: hashScript(reel),
    durationMs: finalDuration,
    words,
    scenes: buildScenes(reel, flat, aligned, finalDuration),
    matchRate: aligned.filter((a) => a.matched).length / aligned.length,
  };
};
