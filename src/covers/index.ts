import type { Portada } from "./Portada.tsx";

/**
 * Portadas de los reels (lo que se ve en la cuadrícula del perfil). Usar el mismo estilo en todas hace que
 * el perfil se vea ordenado; el elegido para A&C es "titular". Se exportan con `npm run portadas`.
 *
 * Texto de portada: siempre en registro profesional (sin jerga), aunque la voz del reel sea coloquial.
 */
export const portadas: Portada[] = [
  {
    id: "riesgo-ia",
    estilo: "titular",
    fondo: "reels/riesgo-ia/b-roll/decision-1.mp4",
    segundo: 1,
    encuadre: "50% 25%",
    etiqueta: "Nadie te cuenta esto",
    titulo: "Antes de implementar\n*IA*\nen tu empresa…",
    acento: "coral",
  },
];
