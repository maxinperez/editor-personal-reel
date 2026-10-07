import { spring, type SpringConfig } from "remotion";

export const SPRINGS = {
  /** Sin rebote: entradas limpias. */
  smooth: { damping: 200 },
  /** Rápido y firme. */
  snappy: { damping: 20, stiffness: 200 },
  /** Con rebote: golpes de atención (ganchos, íconos). */
  pop: { damping: 11, stiffness: 170, mass: 0.6 },
  /** Elástico suave: tarjetas. */
  soft: { damping: 16, stiffness: 120 },
} satisfies Record<string, Partial<SpringConfig>>;

/** Progreso 0→1 de una entrada que arranca en `delay` frames. */
export const enter = (frame: number, fps: number, delay = 0, config: Partial<SpringConfig> = SPRINGS.smooth): number =>
  spring({ frame: frame - delay, fps, config });

export const clamp01 = (v: number): number => Math.min(1, Math.max(0, v));
