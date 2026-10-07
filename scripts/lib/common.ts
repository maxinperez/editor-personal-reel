// Utilidades compartidas por los scripts de npm (Node ejecuta estos .ts directo, sin compilar).
//
// Nota Windows: la ruta del proyecto puede tener caracteres como "&", que rompen `npx` y los .cmd de
// node_modules/.bin. Por eso Remotion (y su FFmpeg) se llaman siempre con `node <archivo.js>`.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { Reel } from "../../src/types.ts";

/** Carpeta raíz del proyecto (donde está package.json). */
export const ROOT = resolve(import.meta.dirname, "..", "..");

/** Corta el script con un mensaje claro. */
export function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

/** Argumentos de la línea de comandos: posicionales y banderas `--nombre` / `--nombre=valor`. */
export const parseArgs = (argv: string[] = process.argv.slice(2)) => ({
  positional: argv.filter((a) => !a.startsWith("--")),
  flag: (name: string): string | undefined => {
    const arg = argv.find((a) => a === `--${name}` || a.startsWith(`--${name}=`));
    if (!arg) return undefined;
    return arg.includes("=") ? arg.slice(arg.indexOf("=") + 1) : "true";
  },
});

/** Los reels registrados en src/reels/index.ts. */
export const loadReels = async (): Promise<Reel[]> =>
  ((await import(pathToFileURL(join(ROOT, "src/reels/index.ts")).href)) as { reels: Reel[] }).reels;

/** Busca un reel por id; si no existe, corta con la lista de los disponibles. */
export const requireReel = (reels: Reel[], id: string | undefined, command: string): Reel => {
  const available = reels.map((r) => r.id).join(", ");
  if (!id) fail(`Indicá el reel. Disponibles: ${available}\n  Ejemplo: npm run ${command} -- ${reels[0]?.id}`);
  const reel = reels.find((r) => r.id === id);
  if (!reel) fail(`No existe el reel "${id}". Disponibles: ${available}`);
  return reel;
};

/**
 * Formatos aceptados para la voz: audio (grabación en off) o video (te grabaste a cámara; se usa su audio).
 * El archivo se llama siempre `voz.<ext>` y va en public/reels/<id>/.
 */
export const VOICE_EXTENSIONS = ["mp3", "wav", "m4a", "aac", "ogg", "mp4", "mov", "webm"];

/** Ruta de la voz dentro de public/ (ej. "reels/mi-reel/voz.m4a"), o undefined si no hay. */
export const findVoice = (reelId: string): string | undefined =>
  VOICE_EXTENSIONS.map((ext) => `reels/${reelId}/voz.${ext}`).find((file) => existsSync(join(ROOT, "public", file)));

const REMOTION_CLI = join(ROOT, "node_modules/@remotion/cli/remotion-cli.js");

/** Corre la CLI de Remotion (`render`, `still`, `ffmpeg`, …). */
export const remotion = (args: string[], { inherit = false } = {}) =>
  spawnSync(process.execPath, [REMOTION_CLI, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    stdio: inherit ? "inherit" : "pipe",
  });

/** Corre el FFmpeg que trae Remotion (no hace falta instalar FFmpeg aparte). */
export const ffmpeg = (args: string[]) => remotion(["ffmpeg", "-y", "-loglevel", "error", ...args]);
