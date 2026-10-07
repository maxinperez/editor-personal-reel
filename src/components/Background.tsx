import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";

/** Fondo de marca que se mantiene todo el reel: degradé azul, brillos que derivan y una grilla sutil. */
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const x1 = 22 + Math.sin(t * 0.45) * 12;
  const y1 = 16 + Math.cos(t * 0.38) * 8;
  const x2 = 82 + Math.cos(t * 0.33) * 10;
  const y2 = 74 + Math.sin(t * 0.42) * 9;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(175deg, ${COLORS.night} 0%, ${COLORS.deep} 52%, ${COLORS.ink} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: [
            `radial-gradient(circle at ${x1}% ${y1}%, rgba(108,199,168,0.20), transparent 36%)`,
            `radial-gradient(circle at ${x2}% ${y2}%, rgba(92,134,214,0.28), transparent 46%)`,
          ].join(","),
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
          backgroundPosition: `0px ${t * 14}px`,
          maskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at 50% 40%, black 20%, transparent 75%)",
        }}
      />
    </AbsoluteFill>
  );
};
