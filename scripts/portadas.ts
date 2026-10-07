// Exporta las portadas de los reels (src/covers/index.ts) para la cuadrícula de Instagram.
//
//   npm run portadas                 -> todas
//   npm run portadas -- riesgo-ia    -> solo esa
//
// Deja en out/portadas/:
//   <id>.png       1080x1920, la que se sube en "Editar portada" del reel
//   <id>-3x4.png   1080x1440, cómo se ve en la cuadrícula del perfil (para revisarla)

import { mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import type { Portada } from "../src/covers/Portada.tsx";
import { fail, ffmpeg, parseArgs, ROOT } from "./lib/common.ts";

// Mismo recorte que CROP_3x4 en src/covers/Portada.tsx (el componente no se importa acá porque es React).
const CROP = { top: 240, height: 1440 };

const { portadas } = (await import(pathToFileURL(join(ROOT, "src/covers/index.ts")).href)) as { portadas: Portada[] };
const only = parseArgs().positional[0];
const list = only ? portadas.filter((p) => p.id === only) : portadas;
if (!list.length) fail(`No hay portada "${only}". Disponibles: ${portadas.map((p) => p.id).join(", ")}`);

console.log("→ Empaquetando…");
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
const outDir = join(ROOT, "out", "portadas");
mkdirSync(outDir, { recursive: true });

for (const p of list) {
  const composition = await selectComposition({ serveUrl, id: `portada-${p.id}` });
  const full = join(outDir, `${p.id}.png`);
  await renderStill({ composition, serveUrl, output: full, imageFormat: "png" });
  const grid = join(outDir, `${p.id}-3x4.png`);
  const r = ffmpeg(["-i", full, "-vf", `crop=1080:${CROP.height}:0:${CROP.top}`, grid]);
  if (r.status !== 0) console.warn(`  ⚠ No pude generar el recorte 3:4: ${(r.stderr || "").slice(-200)}`);
  console.log(`  ✔ ${relative(ROOT, full)}  +  ${relative(ROOT, grid)}`);
}
console.log("");
