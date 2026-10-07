import { loadFont as loadSans } from "@remotion/google-fonts/PublicSans";
import { loadFont as loadSerif } from "@remotion/google-fonts/Newsreader";
import { loadFont as loadInterTight } from "@remotion/google-fonts/InterTight";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";

export const W = 1080;
export const H = 1920;
export const FPS = 30;

/**
 * Zonas seguras de un reel de Instagram (1080x1920):
 * - arriba (~230px) lo tapa el encabezado de la app,
 * - abajo (~340px) lo tapan el pie de foto, el audio y los botones.
 * El contenido va en la zona de arriba y los subtítulos justo debajo, sin pisar la parte baja.
 */
export const LAYOUT = {
  left: 72,
  right: 72,
  top: 230,
  bottom: 1230,
};
export const CONTENT_W = W - LAYOUT.left - LAYOUT.right;
export const CONTENT_H = LAYOUT.bottom - LAYOUT.top;

export const CAPTION_ZONE = { top: 1290, height: 230 };

export const SANS = loadSans("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
}).fontFamily;

export const SERIF = loadSerif("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;
// Subtítulos estilo editorial: sans negrita ajustada + serif cursiva grande (ver referencias/ESTILO-REFERENCIA.md).
export const SANS_TIGHT = loadInterTight("normal", { weights: ["700"], subsets: ["latin"] }).fontFamily;
export const SERIF_ITALIC = loadInstrumentSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

// Cursiva para las palabras resaltadas en las frases en serif.
loadSerif("italic", { weights: ["500", "600", "700"], subsets: ["latin"] });
