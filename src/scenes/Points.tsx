import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { ContentArea, SceneTitle } from "../components/layout.tsx";
import { clamp01, enter, SPRINGS } from "../lib/anim.ts";
import { CONTENT_H, SANS } from "../theme.ts";
import type { PointsScene, Tone } from "../types.ts";

const TONES: Record<Tone, { border: string; iconBg: string; icon: string }> = {
  bad: { border: "rgba(255,138,122,0.38)", iconBg: "rgba(255,138,122,0.16)", icon: COLORS.coral },
  good: { border: "rgba(108,199,168,0.42)", iconBg: "rgba(108,199,168,0.16)", icon: COLORS.mint },
  neutral: { border: COLORS.line, iconBg: "rgba(255,255,255,0.10)", icon: COLORS.paper },
};

/** Lista de tarjetas con ícono que entran una tras otra. Hasta 5 ítems. */
export const Points: React.FC<{ scene: PointsScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const n = scene.items.length;
  const titleH = scene.title ? 96 : 0;
  const gap = 24;
  const cardH = Math.min(210, (CONTENT_H - titleH - gap * (n - 1)) / n);
  const iconBox = Math.min(124, cardH * 0.62);
  const textSize = n <= 3 ? 54 : 46;

  return (
    <ContentArea>
      {scene.title && <SceneTitle text={scene.title} />}
      <div style={{ display: "flex", flexDirection: "column", gap }}>
        {scene.items.map((item, i) => {
          const tone = TONES[item.tone ?? "neutral"];
          const p = enter(frame, fps, 8 + i * 10, SPRINGS.soft);
          const dir = i % 2 === 0 ? -1 : 1;
          return (
            <div
              key={i}
              style={{
                height: cardH,
                display: "flex",
                alignItems: "center",
                gap: 32,
                padding: "0 36px",
                borderRadius: 32,
                background: "rgba(255,255,255,0.065)",
                border: `2px solid ${tone.border}`,
                opacity: clamp01(p * 1.4),
                transform: `translateX(${(1 - p) * 140 * dir}px)`,
              }}
            >
              <div
                style={{
                  width: iconBox,
                  height: iconBox,
                  flexShrink: 0,
                  borderRadius: iconBox * 0.3,
                  background: tone.iconBg,
                  color: tone.icon,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${0.6 + 0.4 * enter(frame, fps, 12 + i * 10, SPRINGS.pop)})`,
                }}
              >
                <Icon name={item.icon} size={iconBox * 0.55} />
              </div>
              <div style={{ fontFamily: SANS, color: COLORS.paper, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: textSize, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
                  {item.text}
                </div>
                {item.sub && (
                  <div style={{ fontWeight: 500, fontSize: 32, lineHeight: 1.25, color: COLORS.muted, marginTop: 8 }}>
                    {item.sub}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ContentArea>
  );
};
