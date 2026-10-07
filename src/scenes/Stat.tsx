import { Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { ContentArea } from "../components/layout.tsx";
import { enter, SPRINGS } from "../lib/anim.ts";
import { SANS, SERIF } from "../theme.ts";
import type { StatScene } from "../types.ts";

const RING = 640;
const STROKE = 22;

/** Un número grande que cuenta hasta su valor dentro de un anillo de progreso. */
export const Stat: React.FC<{ scene: StatScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = interpolate(frame, [6, 46], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const decimals = scene.decimals ?? 0;
  const shown = (scene.value * count).toLocaleString("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  const target = scene.progress ?? (scene.suffix?.trim() === "%" ? Math.min(1, scene.value / 100) : 1);
  const r = (RING - STROKE) / 2;
  const circumference = 2 * Math.PI * r;

  const labelP = enter(frame, fps, 30, SPRINGS.smooth);
  const subP = enter(frame, fps, 40, SPRINGS.smooth);
  const ringP = enter(frame, fps, 0, SPRINGS.smooth);

  const text = `${scene.prefix ?? ""}${shown}${scene.suffix ?? ""}`;
  const numSize = text.length <= 4 ? 230 : text.length <= 6 ? 190 : 150;

  return (
    <ContentArea style={{ alignItems: "center" }}>
      <div style={{ position: "relative", width: RING, height: RING, opacity: ringP }}>
        <svg width={RING} height={RING} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={RING / 2} cy={RING / 2} r={r} fill="none" stroke="rgba(255,255,255,0.10)" strokeWidth={STROKE} />
          <circle
            cx={RING / 2}
            cy={RING / 2}
            r={r}
            fill="none"
            stroke={COLORS.mint}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - target * count)}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: numSize,
            letterSpacing: "-0.03em",
            color: COLORS.paper,
          }}
        >
          {text}
        </div>
      </div>

      <div
        style={{
          marginTop: 52,
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 56,
          lineHeight: 1.15,
          textAlign: "center",
          color: COLORS.paper,
          opacity: labelP,
          transform: `translateY(${(1 - labelP) * 24}px)`,
        }}
      >
        {scene.label}
      </div>
      {(scene.sub || scene.source) && (
        <div
          style={{
            marginTop: 20,
            fontFamily: SANS,
            fontWeight: 500,
            fontSize: 34,
            lineHeight: 1.3,
            textAlign: "center",
            color: COLORS.muted,
            opacity: subP,
          }}
        >
          {scene.sub}
          {scene.sub && scene.source ? " · " : ""}
          {scene.source ? `Fuente: ${scene.source}` : ""}
        </div>
      )}
    </ContentArea>
  );
};
