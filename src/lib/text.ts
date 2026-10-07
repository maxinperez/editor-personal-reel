/** Normaliza una palabra para compararla: minúsculas, sin tildes ni signos. */
export const norm = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]/g, "");

/** Distancia de edición (Levenshtein) entre dos palabras cortas. */
export const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
};

export type EmphasisWord = { word: string; em: boolean };

/**
 * Separa un texto en palabras marcando las que van entre *asteriscos*:
 * "Tu empresa *no* es genérica" -> [..., { word: "no", em: true }, ...]
 */
export const splitEmphasis = (text: string): EmphasisWord[] => {
  const out: EmphasisWord[] = [];
  let em = false;
  let buf = "";
  const flush = () => {
    for (const w of buf.split(/\s+/).filter(Boolean)) out.push({ word: w, em });
    buf = "";
  };
  for (const ch of text) {
    if (ch === "*") {
      flush();
      em = !em;
    } else {
      buf += ch;
    }
  }
  flush();
  return out;
};

/** Texto sin los asteriscos de énfasis. */
export const plain = (text: string): string => text.replace(/\*/g, "");
