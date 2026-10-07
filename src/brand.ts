// Identidad de A&C. Tomada del sitio aycsociotech.com (variables CSS: --ink, --mint, tipografías).
// Si cambia la marca, se cambia acá y todos los reels se actualizan.

export const BRAND = {
  name: "A&C",
  tagline: "Tecnología a medida",
  url: "aycsociotech.com",
  cta: "Agendá una charla",
  /**
   * Logo (ruta dentro de public/). Es el original de A&C (fondo blanco): se muestra recortado sobre una tarjeta blanca.
   * Sin logo se usa el isotipo "A&C" en texto.
   */
  logo: "brand/logo.webp" as string | undefined,
  /** Zona del archivo de logo (2000x2000) que contiene el dibujo, para recortarlo. */
  logoCrop: { x: 330, y: 620, w: 1340, h: 980, size: 2000 },
};

export const COLORS = {
  night: "#0F1B31",
  deep: "#152541",
  ink: "#1F345B",
  green: "#11604F",
  mint: "#6CC7A8",
  paper: "#FFFFFF",
  mist: "#F2F5F9",
  muted: "#B7C3D8",
  line: "rgba(255,255,255,0.14)",
  /** Color de apoyo para lo negativo ("problema"). No es de marca. */
  coral: "#FF8A7A",
};
