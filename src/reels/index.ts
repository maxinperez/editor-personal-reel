import type { Reel } from "../types.ts";
import catalogo from "./catalogo.ts";
import porQueAMedida from "./por-que-a-medida.ts";
import riesgoIa from "./riesgo-ia.ts";

/**
 * Lista de reels. Para crear uno nuevo:
 *  1. copiá src/reels/por-que-a-medida.ts con otro nombre y editá el guion,
 *  2. importalo acá y sumalo a la lista.
 */
export const reels: Reel[] = [riesgoIa, porQueAMedida, catalogo];
