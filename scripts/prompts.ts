// Lista los prompts de las escenas de imagen para generarlas con una herramienta de IA
// (Higgsfield, Canva, Midjourney, etc.) y dónde guardar cada archivo.
//
//   npm run prompts                    (todos los reels)
//   npm run prompts -- <id-del-reel>   (uno solo)

import { existsSync } from "node:fs";
import { join } from "node:path";
import { fail, loadReels, parseArgs, ROOT } from "./lib/common.ts";

/** Estilo común para que todas las imágenes se vean de la misma marca. */
const STYLE =
  "estilo fotográfico editorial, luz natural suave, paleta azul marino y verde menta, " +
  "composición vertical 9:16, espacio libre en el tercio inferior, sin texto ni logos";

const reels = await loadReels();
const only = parseArgs().positional[0];
const selected = only ? reels.filter((r) => r.id === only) : reels;
if (!selected.length) fail(`No existe el reel "${only}". Disponibles: ${reels.map((r) => r.id).join(", ")}`);

let total = 0;
for (const reel of selected) {
  const images = reel.scenes.flatMap((s, i) => (s.type === "image" ? [{ s, n: i + 1 }] : []));
  if (!images.length) continue;
  console.log(`\n=== ${reel.title} (${reel.id}) ===`);
  for (const { s, n } of images) {
    total++;
    const ready = existsSync(join(ROOT, "public", s.src));
    console.log(`\nEscena ${n} ${ready ? "✔ ya existe" : "· falta"}`);
    console.log(`  Guardar en : public/${s.src}`);
    console.log(`  Tamaño     : 1080x1920 (9:16)`);
    console.log(`  Prompt     : ${s.prompt ?? "(sin prompt: agregalo en el guion)"}`);
    console.log(`  + estilo   : ${STYLE}`);
  }
}
console.log(total ? "" : '\nNingún reel tiene escenas de tipo "image" todavía.\n');
