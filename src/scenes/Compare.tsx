import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { ContentArea } from "../components/layout.tsx";
import { clamp01, enter, SPRINGS } from "../lib/anim.ts";
import { CONTENT_H, SANS } from "../theme.ts";
import type { CompareScene, CompareSide } from "../types.ts";

const Panel: React.FC<{
  side: CompareSide;
  good: boolean;
  height: number;
  delay: number;
  from: -1 | 1;
}> = ({ side, good, height, delay, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, delay, SPRINGS.soft);
  const accent = good ? COLORS.mint : COLORS.coral;

  return (
    <div
      style={{
        height,
        borderRadius: 36,
        padding: "34px 40px",
        background: good ? "rgba(108,199,168,0.13)" : "rgba(255,255,255,0.05)",
        border: `2.5px solid ${good ? "rgba(108,199,168,0.65)" : "rgba(255,138,122,0.30)"}`,
        boxShadow: good ? "0 0 70px rgba(108,199,168,0.18)" : "none",
        opacity: clamp01(p * 1.4),
        transform: `translateX(${(1 - p) * 220 * from}px)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 22,
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: accent,
        }}
      >
        {side.title}
      </div>
      {side.items.map((item, i) => {
        const ip = enter(frame, fps, delay + 10 + i * 8, SPRINGS.snappy);
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              opacity: ip,
              transform: `translateX(${(1 - ip) * 30 * from}px)`,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                flexShrink: 0,
                borderRadius: 28,
                background: good ? "rgba(108,199,168,0.22)" : "rgba(255,138,122,0.18)",
                color: accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name={good ? "check" : "x"} size={34} strokeWidth={3} />
            </div>
            <div
              style={{
                fontWeight: 600,
                fontSize: 42,
                lineHeight: 1.15,
                color: good ? COLORS.paper : COLORS.muted,
              }}
            >
              {item}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Dos paneles enfrentados: lo malo/genérico arriba (apagado), lo tuyo abajo (resaltado). */
export const Compare: React.FC<{ scene: CompareScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panelH = (CONTENT_H - 64) / 2;
  const vsP = enter(frame, fps, 16, SPRINGS.pop);

  return (
    <ContentArea>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 64 }}>
        <Panel side={scene.left} good={false} height={panelH} delay={0} from={-1} />
        <Panel side={scene.right} good height={panelH} delay={22} from={1} />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: panelH + 32,
            width: 96,
            height: 96,
            marginLeft: -48,
            marginTop: -48,
            borderRadius: 48,
            background: COLORS.paper,
            color: COLORS.night,
            fontFamily: SANS,
            fontWeight: 800,
            fontSize: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
            transform: `scale(${vsP})`,
          }}
        >
          VS
        </div>
      </div>
    </ContentArea>
  );
};
