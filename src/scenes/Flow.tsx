import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { ContentArea, SceneTitle } from "../components/layout.tsx";
import { clamp01, enter, SPRINGS } from "../lib/anim.ts";
import { CONTENT_H, SANS } from "../theme.ts";
import type { FlowScene } from "../types.ts";

const STEP_GAP = 16; // frames entre un paso y el siguiente

/** Proceso paso a paso: nodos conectados que se dibujan y un pulso que recorre el circuito. */
export const Flow: React.FC<{ scene: FlowScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const n = scene.steps.length;
  const titleH = scene.title ? 96 : 0;
  const outcomeH = scene.outcome ? 130 : 0;
  const avail = CONTENT_H - titleH - outcomeH;
  const rowH = avail / n;
  const node = Math.min(124, rowH * 0.72);
  // Sin subtítulos, el bloque se centra en toda la zona segura en vez de quedar pegado arriba.
  const used = (n - 1) * rowH + node;
  const shift = scene.hideCaptions && !scene.outcome ? Math.max(0, Math.round((CONTENT_H + 340 - used) / 2)) : 0;
  const startAt = (i: number) => (scene.spread ? Math.round(6 + (i / n) * durationInFrames * 0.75) : 6 + i * STEP_GAP);
  const allDrawn = startAt(n - 1) + 20;

  // Pulso: recorre del primer al último nodo y se repite.
  const cycle = 70;
  const pulseT = frame > allDrawn ? ((frame - allDrawn) % cycle) / cycle : -1;
  const pulseY = pulseT >= 0 ? shift + node / 2 + pulseT * (n - 1) * rowH : 0;

  return (
    <ContentArea>
      {scene.title && <SceneTitle text={scene.title} />}
      <div style={{ position: "relative", height: avail }}>
        {scene.steps.map((step, i) => {
          const top = i * rowH + shift;
          const p = enter(frame, fps, startAt(i), SPRINGS.pop);
          const lineP = clamp01(enter(frame, fps, startAt(i) + 6, SPRINGS.snappy));
          const labelP = enter(frame, fps, startAt(i) + 3, SPRINGS.smooth);
          return (
            <div key={i}>
              {i < n - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 40 + node / 2 - 3,
                    top: top + node,
                    width: 6,
                    height: (rowH - node) * lineP,
                    borderRadius: 3,
                    background: `linear-gradient(${COLORS.mint}, rgba(108,199,168,0.35))`,
                  }}
                />
              )}
              <div
                style={{
                  position: "absolute",
                  left: 40,
                  top,
                  width: node,
                  height: node,
                  borderRadius: node * 0.3,
                  background: "rgba(108,199,168,0.16)",
                  border: `3px solid ${COLORS.mint}`,
                  color: COLORS.mint,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${p})`,
                  boxShadow: "0 0 50px rgba(108,199,168,0.25)",
                }}
              >
                <Icon name={step.icon} size={node * 0.5} />
              </div>
              <div
                style={{
                  position: "absolute",
                  left: 40 + node + 40,
                  right: 0,
                  top,
                  height: node,
                  display: "flex",
                  alignItems: "center",
                  fontFamily: SANS,
                  fontWeight: 700,
                  fontSize: 52,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: COLORS.paper,
                  opacity: labelP,
                  transform: `translateX(${(1 - labelP) * 50}px)`,
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}

        {pulseT >= 0 && (
          <div
            style={{
              position: "absolute",
              left: 40 + node / 2 - 14,
              top: pulseY - 14,
              width: 28,
              height: 28,
              borderRadius: 14,
              background: COLORS.paper,
              boxShadow: `0 0 28px 10px rgba(108,199,168,0.8)`,
              opacity: Math.min(1, pulseT * 8, (1 - pulseT) * 8),
            }}
          />
        )}
      </div>

      {scene.outcome && <OutcomePill text={scene.outcome} delay={startAt(n - 1) + 18} height={outcomeH} />}
    </ContentArea>
  );
};

const OutcomePill: React.FC<{ text: string; delay: number; height: number }> = ({ text, delay, height }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, delay, SPRINGS.pop);
  return (
    <div style={{ height, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
          fontFamily: SANS,
          fontWeight: 800,
          fontSize: 44,
          color: COLORS.night,
          background: COLORS.mint,
          borderRadius: 999,
          padding: "22px 46px",
          transform: `scale(${p})`,
          boxShadow: "0 14px 50px rgba(108,199,168,0.35)",
        }}
      >
        <Icon name="zap" size={44} strokeWidth={2.6} />
        {text}
      </div>
    </div>
  );
};
