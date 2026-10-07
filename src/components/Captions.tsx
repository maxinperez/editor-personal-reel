import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { enter, SPRINGS } from "../lib/anim.ts";
import { CAPTION_ZONE, CONTENT_W, LAYOUT, SANS } from "../theme.ts";
import type { Word } from "../types.ts";

type Page = { startMs: number; endMs: number; words: Word[] };

const MAX_WORDS = 4;
const MAX_CHARS = 22;

/** Agrupa palabras en "páginas" de 1 a 4 palabras, cortando en puntuación. */
export const toPages = (words: Word[]): Page[] => {
  const pages: Page[] = [];
  let cur: Word[] = [];
  const flush = () => {
    if (!cur.length) return;
    pages.push({ startMs: cur[0].startMs, endMs: cur[cur.length - 1].endMs, words: cur });
    cur = [];
  };
  for (const w of words) {
    cur.push(w);
    const chars = cur.map((x) => x.text).join(" ").length;
    const sentenceEnd = /[.!?…]$/.test(w.text);
    const clauseEnd = /[,;:]$/.test(w.text);
    if (sentenceEnd || cur.length >= MAX_WORDS || chars >= MAX_CHARS || (clauseEnd && cur.length >= 2)) {
      flush();
    }
  }
  flush();

  // Cada página se queda en pantalla hasta que empieza la siguiente (máx. 600 ms de silencio).
  return pages.map((p, i) => {
    const next = pages[i + 1];
    const end = next ? Math.min(next.startMs, p.endMs + 600) : p.endMs + 400;
    return { ...p, endMs: Math.max(end, p.endMs) };
  });
};

/** Subtítulos grandes, palabra por palabra, dentro de la zona segura de Instagram. */
export const Captions: React.FC<{
  pages: Page[];
  /** Rangos de frames [desde, hasta) donde los subtítulos se ocultan. */
  hidden: [number, number][];
}> = ({ pages, hidden }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  if (hidden.some(([from, to]) => frame >= from && frame < to)) return null;

  const pageIndex = pages.findIndex((p) => nowMs >= p.startMs - 40 && nowMs < p.endMs);
  if (pageIndex < 0) return null;
  const page = pages[pageIndex];

  const pageFrame = frame - Math.floor(((page.startMs - 40) / 1000) * fps);
  const pop = enter(pageFrame, fps, 0, SPRINGS.snappy);

  return (
    <AbsoluteFill
      style={{
        top: CAPTION_ZONE.top,
        height: CAPTION_ZONE.height,
        bottom: "auto",
        left: LAYOUT.left,
        width: CONTENT_W,
        right: "auto",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "0 28px",
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 84,
          lineHeight: 1.14,
          letterSpacing: "-0.01em",
          textAlign: "center",
          transform: `scale(${0.92 + 0.08 * pop})`,
          opacity: Math.min(1, pop * 1.6),
        }}
      >
        {page.words.map((w, i) => {
          const active =
            nowMs >= w.startMs - 30 && (i === page.words.length - 1 || nowMs < page.words[i + 1].startMs - 30);
          const upcoming = nowMs < w.startMs - 30;
          return (
            <span
              key={`${w.startMs}-${i}`}
              style={{
                color: active ? COLORS.mint : COLORS.paper,
                opacity: upcoming ? 0.5 : 1,
                transform: active ? "scale(1.07)" : "scale(1)",
                display: "inline-block",
                textShadow: "0 3px 22px rgba(8,14,28,0.65), 0 1px 3px rgba(8,14,28,0.55)",
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
