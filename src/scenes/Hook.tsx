import { useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLORS } from "../brand.ts";
import { ContentArea } from "../components/layout.tsx";
import { clamp01, enter, SPRINGS } from "../lib/anim.ts";
import { plain, splitEmphasis } from "../lib/text.ts";
import { SANS } from "../theme.ts";
import type { HookScene } from "../types.ts";

/** Gancho: palabras que "golpean" la pantalla. Lo entre *asteriscos* se resalta con marcador. */
export const Hook: React.FC<{ scene: HookScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = splitEmphasis(scene.text);
  const chars = plain(scene.text).length;
  const size = chars <= 24 ? 156 : chars <= 40 ? 132 : 108;
  const kicker = scene.kicker ?? `${BRAND.name} · ${BRAND.tagline}`;

  const kickerP = enter(frame, fps, 0, SPRINGS.smooth);

  return (
    <ContentArea style={{ alignItems: "center" }}>
      <div
        style={{
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 32,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: COLORS.mint,
          background: "rgba(108,199,168,0.13)",
          border: "1.5px solid rgba(108,199,168,0.35)",
          borderRadius: 999,
          padding: "14px 30px",
          marginBottom: 64,
          opacity: kickerP,
          transform: `translateY(${(1 - kickerP) * -24}px)`,
        }}
      >
        {kicker}
      </div>

      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.06,
          letterSpacing: "-0.035em",
          textAlign: "center",
          color: COLORS.paper,
        }}
      >
        {words.map((w, i) => {
          const delay = 5 + i * 4;
          const p = enter(frame, fps, delay, SPRINGS.pop);
          const sweep = w.em ? clamp01(enter(frame, fps, delay + 6, SPRINGS.snappy)) : 0;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                position: "relative",
                marginRight: "0.22em",
                opacity: clamp01(p * 2),
                transform: `translateY(${(1 - p) * 70}px) scale(${1.35 - 0.35 * p})`,
              }}
            >
              {w.em && (
                <span
                  style={{
                    position: "absolute",
                    inset: "6% -0.12em 2% -0.12em",
                    borderRadius: "0.16em",
                    background: COLORS.mint,
                    transformOrigin: "left center",
                    transform: `scaleX(${sweep})`,
                  }}
                />
              )}
              <span style={{ position: "relative", color: w.em && sweep > 0.45 ? COLORS.night : COLORS.paper }}>
                {w.word}
              </span>
            </span>
          );
        })}
      </div>
    </ContentArea>
  );
};
