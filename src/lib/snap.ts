// Ajusta los tiempos de Whisper a la voz real.
//
// - `startMs`/`endMs` de whisper.cpp 1.5.5 son aproximados: cada palabra "empieza" donde termina la
//   anterior, así que las pausas quedan pegadas a alguna palabra.
// - `dtwMs` (DTW) marca bien el orden y el ritmo, pero llega un poco tarde respecto de cuándo empieza
//   la palabra. Ese retraso se mide en la propia grabación: las palabras que vienen después de una pausa
//   empiezan exactamente cuando vuelve la voz.
// - Al final, ningún inicio cae dentro de un silencio y cada palabra termina cuando empieza una pausa.

import type { Heard } from "./align.ts";

export type Silence = { startMs: number; endMs: number };

const HOP_MS = 10;

/** Silencios de al menos `minMs`, a partir de muestras PCM mono de 16 bits. */
export const findSilences = (pcm: Int16Array, sampleRate: number, minMs = 120): Silence[] => {
  const hop = Math.round((sampleRate * HOP_MS) / 1000);
  const db: number[] = [];
  for (let i = 0; i + hop <= pcm.length; i += hop) {
    let sum = 0;
    for (let j = i; j < i + hop; j++) sum += pcm[j] * pcm[j];
    db.push(10 * Math.log10(sum / hop / (32768 * 32768) + 1e-12));
  }
  if (!db.length) return [];

  // Umbral relativo a la grabación: entre el piso de ruido y el nivel típico de la voz.
  const sorted = [...db].sort((a, b) => a - b);
  const pct = (q: number) => sorted[Math.floor(q * (sorted.length - 1))];
  const threshold = pct(0.1) + 0.35 * (pct(0.9) - pct(0.1));

  const out: Silence[] = [];
  let from = -1;
  for (let i = 0; i <= db.length; i++) {
    const quiet = i < db.length && db[i] < threshold;
    if (quiet && from < 0) from = i;
    if (!quiet && from >= 0) {
      if ((i - from) * HOP_MS >= minMs) out.push({ startMs: from * HOP_MS, endMs: i * HOP_MS });
      from = -1;
    }
  }
  return out;
};

const median = (xs: number[]): number => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};

/** Cuánto se atrasa DTW: mediana de (dtw − fin de la pausa) en las palabras que siguen a una pausa. */
export const dtwLag = (heard: Heard[], silences: Silence[]): number => {
  const lags: number[] = [];
  for (const h of heard) {
    if (h.dtwMs === undefined) continue;
    const pause = silences.find((s) => s.endMs <= h.dtwMs! && h.dtwMs! - s.endMs < 400);
    if (pause && pause.endMs - pause.startMs >= 250) lags.push(h.dtwMs - pause.endMs);
  }
  return lags.length >= 3 ? Math.min(300, Math.max(0, median(lags))) : 120;
};

/** Tiempos de cada palabra pegados a la voz real (ver comentario al inicio del archivo). */
export const snapToSpeech = (heard: Heard[], silences: Silence[]): Heard[] => {
  const lag = dtwLag(heard, silences);
  const words = heard.map((h) => ({ ...h }));

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const marker = w.dtwMs ?? w.startMs;
    let start = w.dtwMs !== undefined ? w.dtwMs - lag : w.startMs;
    // Si entre el inicio estimado y la marca de la palabra hay una pausa, la palabra empieza al terminar esa pausa.
    const pause =
      silences.filter((s) => s.endMs > start && s.endMs <= marker).pop() ??
      silences.find((s) => start >= s.startMs && start < s.endMs);
    if (pause) start = pause.endMs;
    if (i > 0) start = Math.max(start, words[i - 1].startMs + 40);
    w.startMs = Math.round(start);
  }

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = i < words.length - 1 ? words[i + 1].startMs : Math.max(w.endMs, w.startMs + 400);
    const pause = silences.find((s) => s.startMs > w.startMs && s.startMs < next);
    w.endMs = Math.round(Math.max(pause ? pause.startMs : next, w.startMs + 40));
  }
  return words;
};
