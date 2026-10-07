import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { enter, SPRINGS } from "../lib/anim.ts";
import { CONTENT_H, CONTENT_W, LAYOUT, SANS } from "../theme.ts";

/** Zona de contenido: entre el encabezado de Instagram y los subtítulos. */
export const ContentArea: React.FC<{ children: ReactNode; style?: CSSProperties }> = ({ children, style }) => (
  <AbsoluteFill
    style={{
      top: LAYOUT.top,
      height: CONTENT_H,
      bottom: "auto",
      left: LAYOUT.left,
      width: CONTENT_W,
      right: "auto",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      ...style,
    }}
  >
    {children}
  </AbsoluteFill>
);

/** Rótulo pequeño en mayúsculas sobre el contenido. */
export const SceneTitle: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, delay, SPRINGS.smooth);
  return (
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 36,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: COLORS.mint,
        opacity: p,
        transform: `translateY(${(1 - p) * 20}px)`,
        marginBottom: 36,
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
};
