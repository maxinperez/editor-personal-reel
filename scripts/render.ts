// Exporta un reel a MP4 listo para Instagram (1080x1920, H.264, AAC).
//
//   npm run render -- <id-del-reel>        (ej. npm run render -- riesgo-ia)
//   -> out/<id>.mp4

import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { hashScript } from "../src/lib/timing.ts";
import type { Timing } from "../src/types.ts";
import { fail, findVoice, loadReels, parseArgs, remotion, requireReel, ROOT } from "./lib/common.ts";

const reel = requireReel(await loadReels(), parseArgs().positional[0], "render");

// Si grabaste la voz pero no la procesaste (o cambiaste el guion después), el video saldría desincronizado.
if (findVoice(reel.id)) {
  const timingPath = join(ROOT, "public", "reels", reel.id, "timing.json");
  const stale =
    !existsSync(timingPath) || (JSON.parse(readFileSync(timingPath, "utf8")) as Timing).scriptHash !== hashScript(reel);
  if (stale)
    fail(
      `La voz de "${reel.id}" no está procesada o el guion cambió desde entonces.\n  Corré primero: npm run voz -- ${reel.id}`,
    );
}

mkdirSync(join(ROOT, "out"), { recursive: true });
const output = join("out", `${reel.id}.mp4`);
// Códec, calidad y formato de píxel salen de remotion.config.ts.
const res = remotion(["render", "src/index.ts", reel.id, output, "--audio-codec=aac"], { inherit: true });

if (res.status === 0) console.log(`\n✔ Reel listo: ${output}\n`);
process.exit(res.status ?? 1);
