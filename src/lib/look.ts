/**
 * "Looks" de color para material filmado (B-roll y fondos de portada). Cada uno combina un ajuste de
 * color sobre la imagen con un tinte de marca encima, para que clips de distintas fuentes se vean
 * parejos y el texto blanco siempre se lea.
 */
export type LookName = "ninguno" | "cine" | "frio" | "calido";

export const LOOKS: Record<LookName, { filter: string; tint: string }> = {
  ninguno: { filter: "none", tint: "rgba(15,27,49,0.22)" },
  cine: { filter: "contrast(1.1) saturate(0.88) brightness(0.92)", tint: "rgba(10,20,40,0.34)" },
  frio: { filter: "contrast(1.1) saturate(0.8) brightness(0.9)", tint: "rgba(10,45,70,0.40)" },
  calido: { filter: "contrast(1.05) saturate(1.05) brightness(0.95)", tint: "rgba(70,40,15,0.26)" },
};

const VIDEO_EXTENSIONS = /\.(mp4|mov|webm|mkv|m4v)$/i;

/** ¿La ruta es un video (y no una imagen)? */
export const isVideoFile = (src: string): boolean => VIDEO_EXTENSIONS.test(src);
