import { useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { ContentArea } from "../components/layout.tsx";
import { clamp01, enter, SPRINGS } from "../lib/anim.ts";
import { CONTENT_W, SANS } from "../theme.ts";
import type { SheetScene } from "../types.ts";

const ROW_H = 78;
const HEAD_H = 66;
const BAR_H = 74;

/**
 * Planilla de ejemplo: las filas entran una a una, algunas celdas fallan (rojo) y al final aparece
 * una alerta. Los datos son de relleno: sirve para ilustrar errores y riesgos, no datos reales.
 */
export const Sheet: React.FC<{ scene: SheetScene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const colW = CONTENT_W / scene.columns.length;
  const errorAt = (r: number, c: number) => scene.errors.findIndex((e) => e.row === r && e.col === c);
  const alertFrame = Math.round(durationInFrames * 0.58);
  const alertP = enter(frame, fps, alertFrame, SPRINGS.pop);
  const cardP = enter(frame, fps, 0, SPRINGS.soft);
  const tableH = BAR_H + HEAD_H + ROW_H * scene.rows.length;

  return (
    <ContentArea style={{ justifyContent: "flex-start", paddingTop: 30 }}>
      <div
        style={{ position: "relative", opacity: clamp01(cardP * 1.4), transform: `translateY(${(1 - cardP) * 60}px)` }}
      >
        <div
          style={{
            height: tableH,
            borderRadius: 30,
            overflow: "hidden",
            background: "rgba(255,255,255,0.07)",
            border: `2px solid ${COLORS.line}`,
            fontFamily: SANS,
            boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              height: BAR_H,
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "0 28px",
              background: "rgba(255,255,255,0.10)",
            }}
          >
            {["#FF8A7A", "#F5C26B", "#6CC7A8"].map((c) => (
              <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c, opacity: 0.9 }} />
            ))}
            <div style={{ marginLeft: 16, fontSize: 30, fontWeight: 600, color: COLORS.muted }}>{scene.title}</div>
          </div>

          <div style={{ height: HEAD_H, display: "flex", alignItems: "center", background: "rgba(255,255,255,0.06)" }}>
            {scene.columns.map((c) => (
              <div
                key={c}
                style={{
                  width: colW,
                  padding: "0 28px",
                  fontSize: 28,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: COLORS.mint,
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {scene.rows.map((row, r) => {
            const rowP = enter(frame, fps, 8 + r * 5, SPRINGS.smooth);
            return (
              <div
                key={r}
                style={{
                  height: ROW_H,
                  display: "flex",
                  alignItems: "center",
                  borderTop: `1px solid ${COLORS.line}`,
                  opacity: rowP,
                  transform: `translateX(${(1 - rowP) * -40}px)`,
                }}
              >
                {row.map((cell, c) => {
                  const e = errorAt(r, c);
                  const start = 24 + (e < 0 ? 0 : e) * 14;
                  const failed = e >= 0 && frame >= start;
                  const k = failed ? clamp01((frame - start) / 4) : 0;
                  const shake =
                    failed && frame - start < 8 ? Math.sin((frame - start) * 2.4) * 6 * (1 - (frame - start) / 8) : 0;
                  return (
                    <div
                      key={c}
                      style={{
                        width: colW,
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        padding: "0 28px",
                        position: "relative",
                      }}
                    >
                      {failed && (
                        <div
                          style={{
                            position: "absolute",
                            inset: "10px 14px",
                            borderRadius: 12,
                            background: `rgba(255,138,122,${0.22 * k})`,
                            border: `2px solid rgba(255,138,122,${k})`,
                          }}
                        />
                      )}
                      <div
                        style={{
                          position: "relative",
                          fontSize: 32,
                          fontWeight: failed ? 800 : 500,
                          color: failed ? COLORS.coral : COLORS.paper,
                          transform: `translateX(${shake}px)`,
                        }}
                      >
                        {failed ? e >= 0 && scene.errors[e].label : cell}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {scene.alert && frame >= alertFrame && (
          <div
            style={{
              position: "absolute",
              left: 24,
              right: 24,
              bottom: -130,
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "26px 30px",
              borderRadius: 26,
              background: "#FFFFFF",
              color: COLORS.night,
              fontFamily: SANS,
              boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
              transform: `scale(${0.85 + 0.15 * alertP}) translateY(${(1 - alertP) * 50}px)`,
              opacity: clamp01(alertP * 2),
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                flexShrink: 0,
                borderRadius: 38,
                background: COLORS.coral,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon name="shield" size={42} color={COLORS.night} strokeWidth={2.6} />
            </div>
            <div>
              <div style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.1 }}>{scene.alert.title}</div>
              <div style={{ fontSize: 28, fontWeight: 500, color: "#4A5873", marginTop: 6 }}>{scene.alert.text}</div>
            </div>
          </div>
        )}
      </div>
    </ContentArea>
  );
};
