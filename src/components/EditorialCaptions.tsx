import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp01 } from "../lib/anim.ts";
import { CONTENT_W, H, LAYOUT, SANS_TIGHT, SERIF_ITALIC } from "../theme.ts";
import type { Word } from "../types.ts";

/**
 * Subtítulos "editoriales" (ver referencias/ESTILO-REFERENCIA.md):
 * - las palabras comunes se acumulan una a una en sans negrita pequeña,
 * - la palabra clave (*marcada* en el guion) entra de golpe en serif cursiva grande,
 * - el bloque queda quieto y se reemplaza en seco al cambiar de frase.
 */
export type Block = {
  startMs: number;
  endMs: number;
  pre: Word[];
  serif: Word[];
  post: Word[];
};

const SANS_SIZE = 66;
const SENTENCE_END = /[.!?…]$/;
const CLAUSE_END = /[,;:]$/;

/** Agrupa palabras en bloques: hasta 4 comunes antes, una palabra clave (o frase) y hasta 2 comunes después. */
export const toBlocks = (words: Word[]): Block[] => {
  type Draft = { pre: Word[]; serif: Word[]; post: Word[] };
  const drafts: Draft[] = [];
  let cur: Draft = { pre: [], serif: [], post: [] };
  const size = () => cur.pre.length + cur.serif.length + cur.post.length;
  const flush = () => {
    if (size()) drafts.push(cur);
    cur = { pre: [], serif: [], post: [] };
  };

  for (const w of words) {
    if (w.em) {
      if (cur.post.length) flush();
      cur.serif.push(w);
    } else if (cur.serif.length) {
      if (cur.post.length >= 2) flush();
      if (cur.serif.length) cur.post.push(w);
      else cur.pre.push(w);
    } else {
      if (cur.pre.length >= 4) flush();
      cur.pre.push(w);
    }
    if (SENTENCE_END.test(w.text)) flush();
    else if (CLAUSE_END.test(w.text)) flush();
  }
  flush();

  return drafts.map((d, i) => {
    const all = [...d.pre, ...d.serif, ...d.post];
    const startMs = all[0].startMs;
    const lastEnd = all[all.length - 1].endMs;
    const next = drafts[i + 1];
    const nextStart = next ? [...next.pre, ...next.serif, ...next.post][0].startMs : Infinity;
    // Se queda hasta que empieza el siguiente bloque (como mucho 700 ms de silencio).
    const endMs = Math.max(lastEnd, Math.min(nextStart, lastEnd + 700));
    return { ...d, startMs, endMs: Number.isFinite(endMs) ? endMs : lastEnd + 500 };
  });
};

/** Texto de pantalla: sin puntos, comas ni dos puntos (se conservan ¿ ? ¡ ! y la ortografía original). */
const show = (text: string) => text.replace(/[.,;:…]+$/g, "").replace(/^[.,;:…]+/g, "");

const SHADOW_SANS = "0 3px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)";
const SHADOW_SERIF = "0 5px 20px rgba(0,0,0,0.55), 0 1px 4px rgba(0,0,0,0.4)";

export const EditorialCaptions: React.FC<{
  blocks: Block[];
  /** Rangos de frames [desde, hasta) donde los subtítulos se ocultan. */
  hidden: [number, number][];
  /** Altura del centro del bloque (% del alto) para cada escena. */
  positions: { from: number; to: number; y: number }[];
}> = ({ blocks, hidden, positions }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  if (hidden.some(([from, to]) => frame >= from && frame < to)) return null;
  const block = blocks.find((b) => nowMs >= b.startMs - 40 && nowMs < b.endMs);
  if (!block) return null;

  const y = positions.find((p) => frame >= p.from && frame < p.to)?.y ?? 54;
  const serifText = block.serif.map((w) => show(w.text)).join(" ");
  const chars = Math.max(serifText.length, 4);
  // La palabra se ajusta para ocupar ~60 % del ancho: las cortas crecen, las largas se achican.
  const S = Math.round(Math.max(110, Math.min(300, 640 / (0.4 * chars))));

  const appear = (w: Word, kind: "sans" | "serif") => {
    const start = (w.startMs / 1000) * fps - 0.5;
    const t = clamp01((frame - start) / 2); // ~80 ms
    if (frame < start) return { opacity: 0, transform: "none" };
    return kind === "sans"
      ? { opacity: t, transform: `translateY(${(1 - t) * 8}px)` }
      : { opacity: 0.6 + 0.4 * t, transform: "none" };
  };

  const smallLine = (words: Word[], style: React.CSSProperties) => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "0 0.28em",
        fontFamily: SANS_TIGHT,
        fontWeight: 700,
        fontSize: SANS_SIZE,
        lineHeight: 1.08,
        letterSpacing: "-0.04em",
        color: "#FFFFFF",
        textShadow: SHADOW_SANS,
        position: "relative",
        zIndex: 2,
        ...style,
      }}
    >
      {words.map((w, i) => (
        <span key={i} style={{ whiteSpace: "nowrap", ...appear(w, "sans") }}>
          {show(w.text)}
        </span>
      ))}
    </div>
  );

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          left: LAYOUT.left,
          width: CONTENT_W,
          top: (H * y) / 100,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {block.pre.length > 0 && smallLine(block.pre, { marginBottom: block.serif.length ? -S * 0.16 : 0 })}
        {block.serif.length > 0 && (
          <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-end" }}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "0 0.2em",
                fontFamily: SERIF_ITALIC,
                fontStyle: "italic",
                fontWeight: 400,
                fontSize: S,
                lineHeight: 0.92,
                letterSpacing: "-0.03em",
                color: "#FFFFFF",
                textShadow: SHADOW_SERIF,
                padding: "0 0.05em",
              }}
            >
              {block.serif.map((w, i) => (
                <span key={i} style={{ whiteSpace: "nowrap", ...appear(w, "serif") }}>
                  {show(w.text)}
                </span>
              ))}
            </div>
            {block.post.length > 0 && smallLine(block.post, { marginTop: -S * 0.06 })}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
