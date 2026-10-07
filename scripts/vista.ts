// Genera una imagen por escena para revisar el reel sin esperar un render completo.
//
//   npm run vista -- <id-del-reel>      -> out/vista/<id>-01.png, <id>-02.png, ...

import { mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import type { ReelProps } from "../src/types.ts";
import { loadReels, parseArgs, requireReel, ROOT } from "./lib/common.ts";

const reel = requireReel(await loadReels(), parseArgs().positional[0], "vista");

console.log("→ Empaquetando…");
const serveUrl = await bundle({ entryPoint: join(ROOT, "src/index.ts"), publicDir: join(ROOT, "public") });
const composition = await selectComposition({ serveUrl, id: reel.id });
const { timing } = composition.props as unknown as ReelProps;

const outDir = join(ROOT, "out", "vista");
mkdirSync(outDir, { recursive: true });

for (const [i, scene] of timing.scenes.entries()) {
  const from = Math.round((scene.startMs / 1000) * composition.fps);
  const to = Math.min(composition.durationInFrames, Math.round((scene.endMs / 1000) * composition.fps));
  // Casi al final de la escena: ya terminaron las animaciones de entrada y todavía no sale.
  const frame = Math.max(from, Math.min(to - 10, from + Math.round((to - from) * 0.85)));
  const output = join(outDir, `${reel.id}-${String(i + 1).padStart(2, "0")}.png`);
  await renderStill({ composition, serveUrl, output, frame, imageFormat: "png" });
  console.log(`  ✔ escena ${i + 1} (frame ${frame}) → ${relative(ROOT, output)}`);
}
console.log("");
