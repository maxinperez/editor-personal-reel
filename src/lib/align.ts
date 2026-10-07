import { editDistance, norm } from "./text.ts";

/** Palabra que escuchó Whisper. `dtwMs`: momento en que se dice (más preciso que `startMs`), si está. */
export type Heard = { text: string; startMs: number; endMs: number; dtwMs?: number };
export type Timed = { startMs: number; endMs: number; matched: boolean };

const MATCH = 2;
const NEAR = 1;
const SUBST = -1;
const GAP = -1;

/** Qué tan parecidas son dos palabras normalizadas (palabras que Whisper escribe distinto). */
const score = (a: string, b: string): number => {
  if (!a || !b) return SUBST;
  if (a === b) return MATCH;
  const min = Math.min(a.length, b.length);
  if (min >= 4 && editDistance(a, b) <= 1) return NEAR;
  if (min >= 7 && editDistance(a, b) <= 2) return NEAR;
  return SUBST;
};

/**
 * Alinea las palabras del guion con las palabras que Whisper escuchó (Needleman-Wunsch).
 * Devuelve, para cada palabra del guion, el momento en que se dijo. Las palabras que
 * Whisper no reconoció se interpolan entre sus vecinas.
 */
export const alignScript = (script: string[], heard: Heard[]): Timed[] => {
  const a = script.map(norm);
  const b = heard.map((h) => norm(h.text));
  const n = a.length;
  const m = b.length;

  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 1; i <= n; i++) dp[i][0] = i * GAP;
  for (let j = 1; j <= m; j++) dp[0][j] = j * GAP;
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      dp[i][j] = Math.max(dp[i - 1][j - 1] + score(a[i - 1], b[j - 1]), dp[i - 1][j] + GAP, dp[i][j - 1] + GAP);
    }
  }

  // Recorrido hacia atrás: pair[i] = índice de la palabra escuchada asignada, o -1.
  const pair = new Array<number>(n).fill(-1);
  let i = n;
  let j = m;
  while (i > 0 && j > 0) {
    const s = score(a[i - 1], b[j - 1]);
    if (dp[i][j] === dp[i - 1][j - 1] + s) {
      pair[i - 1] = j - 1;
      i--;
      j--;
    } else if (dp[i][j] === dp[i - 1][j] + GAP) {
      i--;
    } else {
      j--;
    }
  }

  const out: Timed[] = script.map((_, k) => {
    const p = pair[k];
    if (p < 0) return { startMs: NaN, endMs: NaN, matched: false };
    return {
      startMs: heard[p].startMs,
      endMs: heard[p].endMs,
      matched: score(a[k], b[p]) > 0,
    };
  });

  // Interpolación de las palabras sin asignar.
  const DEFAULT_WORD_MS = 350;
  let k = 0;
  while (k < n) {
    if (!Number.isNaN(out[k].startMs)) {
      k++;
      continue;
    }
    let end = k;
    while (end < n && Number.isNaN(out[end].startMs)) end++;
    const count = end - k;
    const prevEnd = k > 0 ? out[k - 1].endMs : NaN;
    const nextStart = end < n ? out[end].startMs : NaN;

    for (let t = 0; t < count; t++) {
      let start: number;
      let stop: number;
      if (!Number.isNaN(prevEnd) && !Number.isNaN(nextStart)) {
        const slot = Math.max(0, nextStart - prevEnd) / count;
        start = prevEnd + slot * t;
        stop = start + slot;
      } else if (!Number.isNaN(prevEnd)) {
        start = prevEnd + DEFAULT_WORD_MS * t;
        stop = start + DEFAULT_WORD_MS;
      } else if (!Number.isNaN(nextStart)) {
        start = Math.max(0, nextStart - DEFAULT_WORD_MS * (count - t));
        stop = start + DEFAULT_WORD_MS;
      } else {
        start = DEFAULT_WORD_MS * (k + t);
        stop = start + DEFAULT_WORD_MS;
      }
      out[k + t] = { startMs: Math.round(start), endMs: Math.round(stop), matched: false };
    }
    k = end;
  }

  return out;
};
