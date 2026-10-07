import type { ReactNode } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, Easing } from "remotion";

/** Cuántos frames se solapa una escena con la siguiente para el cruce de entrada/salida. */
export const OVERLAP = 7;

/**
 * Marco común de cada escena: entra subiendo con fundido y, si hay otra escena detrás,
 * sale hacia arriba durante el solapamiento. Así los cortes se sienten fluidos pero rápidos.
 */
export const SceneFrame: React.FC<{
  durationInFrames: number;
  hasNext: boolean;
  fullBleed?: boolean;
  children: ReactNode;
}> = ({ durationInFrames, hasNext, fullBleed, children }) => {
  const frame = useCurrentFrame();

  const inP = interpolate(frame, [0, OVERLAP], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outP = hasNext
    ? interpolate(frame, [durationInFrames - OVERLAP, durationInFrames], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.in(Easing.cubic),
      })
    : 0;

  // Las escenas a pantalla completa (video, imágenes) entran con corte seco, como en la referencia.
  const opacity = fullBleed ? 1 : inP * (1 - outP);
  const translateY = (1 - inP) * 36 - outP * 36;

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: fullBleed ? undefined : `translateY(${translateY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
