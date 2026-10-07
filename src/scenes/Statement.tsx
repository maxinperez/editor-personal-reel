import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { ContentArea } from "../components/layout.tsx";
import { enter, SPRINGS } from "../lib/anim.ts";
import { plain, splitEmphasis } from "../lib/text.ts";
import { SANS, SERIF } from "../theme.ts";
import type { StatementScene } from "../types.ts";

/** Frase en serif que se revela palabra por palabra (de borroso a nítido). */
export const Statement: React.FC<{ scene: StatementScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = splitEmphasis(scene.text);
  const chars = plain(scene.text).length;
  const size = chars <= 16 ? 150 : chars <= 34 ? 120 : chars <= 54 ? 100 : 84;

  const lineP = enter(frame, fps, 0, SPRINGS.smooth);
  const subDelay = 10 + words.length * 4 + 6;
  const subP = enter(frame, fps, subDelay, SPRINGS.smooth);

  return (
    <ContentArea style={{ alignItems: "center" }}>
      <div
        style={{
          width: 150 * lineP,
          height: 6,
          borderRadius: 3,
          background: COLORS.mint,
          marginBottom: 60,
        }}
      />
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: COLORS.paper,
        }}
      >
        {words.map((w, i) => {
          const p = enter(frame, fps, 6 + i * 4, SPRINGS.smooth);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.24em",
                opacity: p,
                filter: `blur(${interpolate(p, [0, 1], [14, 0])}px)`,
                transform: `translateY(${(1 - p) * 34}px)`,
                color: w.em ? COLORS.mint : COLORS.paper,
                fontStyle: w.em ? "italic" : "normal",
              }}
            >
              {w.word}
            </span>
          );
        })}
      </div>
      {scene.sub && (
        <div
          style={{
            marginTop: 56,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 44,
            lineHeight: 1.3,
            textAlign: "center",
            color: COLORS.muted,
            opacity: subP,
            transform: `translateY(${(1 - subP) * 20}px)`,
          }}
        >
          {scene.sub}
        </div>
      )}
    </ContentArea>
  );
};
