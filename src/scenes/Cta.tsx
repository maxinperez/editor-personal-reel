import { useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND, COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { ContentArea } from "../components/layout.tsx";
import { Logo } from "../components/Logo.tsx";
import { enter, SPRINGS } from "../lib/anim.ts";
import { plain, splitEmphasis } from "../lib/text.ts";
import { SANS } from "../theme.ts";
import type { CtaScene } from "../types.ts";

/** Cierre: marca, llamada a la acción y botón que "late". */
export const Cta: React.FC<{ scene: CtaScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = splitEmphasis(scene.headline);
  const size = plain(scene.headline).length <= 18 ? 130 : 108;
  const logoP = enter(frame, fps, 0, SPRINGS.pop);
  const subDelay = 12 + words.length * 4;
  const subP = enter(frame, fps, subDelay, SPRINGS.smooth);
  const btnP = enter(frame, fps, subDelay + 8, SPRINGS.pop);
  const pulse = 1 + Math.sin(frame / 7) * 0.018;
  const glow = 0.28 + (Math.sin(frame / 7) + 1) * 0.12;

  return (
    <ContentArea style={{ alignItems: "center" }}>
      <div style={{ transform: `scale(${logoP}) rotate(${(1 - logoP) * -12}deg)`, marginBottom: 56 }}>
        <Logo size={168} />
      </div>

      <div
        style={{
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          textAlign: "center",
          color: COLORS.paper,
        }}
      >
        {words.map((w, i) => {
          const p = enter(frame, fps, 8 + i * 4, SPRINGS.pop);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.22em",
                opacity: Math.min(1, p * 2),
                transform: `translateY(${(1 - p) * 50}px)`,
                color: w.em ? COLORS.mint : COLORS.paper,
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
            marginTop: 30,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 42,
            lineHeight: 1.3,
            textAlign: "center",
            color: COLORS.muted,
            opacity: subP,
          }}
        >
          {scene.sub}
        </div>
      )}

      <div
        style={{
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 50,
          color: COLORS.night,
          background: COLORS.mint,
          borderRadius: 999,
          padding: "28px 56px",
          transform: `scale(${btnP * pulse})`,
          boxShadow: `0 0 0 ${10 + Math.sin(frame / 7) * 4}px rgba(108,199,168,${glow}), 0 16px 60px rgba(108,199,168,0.35)`,
        }}
      >
        {scene.url ?? BRAND.url}
        <Icon name="arrow" size={50} strokeWidth={2.8} />
      </div>
    </ContentArea>
  );
};
