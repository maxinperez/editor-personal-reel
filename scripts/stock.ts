// Busca y baja clips de stock de Pexels (licencia gratuita para uso comercial) ya recortados a 9:16.
//
//   npm run stock -- buscar "persona frustrada computadora" [--cantidad=12] [--orientacion=portrait]
//       Lista resultados y arma una hoja de miniaturas en out/stock/<consulta>.png
//
//   npm run stock -- bajar <id> --reel=riesgo-ia --nombre=frustrado-1 [--desde=0] [--duracion=10] [--centro=0.5]
//       Baja el video, lo recorta a 1080x1920 sin audio y lo guarda en public/reels/<reel>/b-roll/<nombre>.mp4
//       (--centro: 0 = izquierda, 0.5 = centro, 1 = derecha, para clips horizontales)
//
// Requiere una clave gratuita de Pexels en el archivo .env:   PEXELS_API_KEY=tu_clave   (ver .env.example)
// Se obtiene en https://www.pexels.com/api/ (con una cuenta gratuita). La clave nunca se sube a git.

import {
  appendFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, relative } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { fail, ffmpeg, parseArgs, ROOT as root } from "./lib/common.ts";
import type { SheetItem } from "./stock-sheet/entry.tsx";

process.chdir(root);

const API = "https://api.pexels.com";

type PexelsFile = { quality: string; file_type: string; width: number; height: number; fps: number; link: string };
type PexelsVideo = {
  id: number;
  width: number;
  height: number;
  duration: number;
  url: string;
  image: string;
  user: { name: string; url: string };
  video_files: PexelsFile[];
};

try {
  process.loadEnvFile(join(root, ".env"));
} catch {
  /* se valida abajo */
}
const key = process.env.PEXELS_API_KEY?.trim();
if (!key) {
  fail(
    "Falta la clave de Pexels.\n" +
      "  1. Creá una cuenta gratuita en https://www.pexels.com y pedí la clave en https://www.pexels.com/api/\n" +
      "  2. Creá el archivo  reels\\.env  con esta línea (sin comillas):\n" +
      "       PEXELS_API_KEY=tu_clave_aca",
  );
}

const {
  positional: [command, ...positional],
  flag,
} = parseArgs();

const api = async <T>(path: string): Promise<T> => {
  const res = await fetch(`${API}${path}`, { headers: { Authorization: key as string } });
  if (res.status === 401 || res.status === 403) fail("Pexels rechazó la clave. Revisá que esté bien copiada en .env.");
  if (res.status === 429) fail("Se superó el límite de pedidos de Pexels (200 por hora). Probá más tarde.");
  if (!res.ok) fail(`Pexels respondió ${res.status} ${res.statusText}.`);
  return (await res.json()) as T;
};

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

// ---------------------------------------------------------------------------------------------
if (command === "buscar") {
  const query = positional.join(" ").trim();
  if (!query) fail('Indicá qué buscar. Ejemplo: npm run stock -- buscar "equipo en reunión de oficina"');
  const count = Math.min(40, Number(flag("cantidad") ?? 12));
  const orientation = flag("orientacion") ?? "portrait";

  const data = await api<{ videos: PexelsVideo[]; total_results: number }>(
    `/videos/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=${count}`,
  );
  if (!data.videos.length)
    fail(`Sin resultados para "${query}". Probá con otras palabras (en inglés suele haber más).`);

  console.log(`\n"${query}" — ${data.total_results} resultados (${orientation}). Mostrando ${data.videos.length}:\n`);
  for (const v of data.videos) {
    console.log(
      `  ${String(v.id).padEnd(9)} ${String(v.duration).padStart(3)} s  ${v.width}x${v.height}  ${v.user.name}  ${v.url}`,
    );
  }

  const items: SheetItem[] = data.videos.map((v) => ({
    image: v.image,
    label: `${v.id} · ${v.duration}s · ${v.width}x${v.height}`,
  }));
  const { bundle } = await import("@remotion/bundler");
  const { renderStill, selectComposition } = await import("@remotion/renderer");
  const serveUrl = await bundle({ entryPoint: join(root, "scripts/stock-sheet/entry.tsx") });
  const inputProps = { items, cols: 4 };
  const composition = await selectComposition({ serveUrl, id: "stock-sheet", inputProps });
  mkdirSync(join(root, "out", "stock"), { recursive: true });
  const output = join(root, "out", "stock", `${slug(query)}.png`);
  await renderStill({ composition, serveUrl, output, inputProps, imageFormat: "png" });
  console.log(
    `\n✔ Hoja de miniaturas: ${relative(root, output)}\n  Para bajar uno:  npm run stock -- bajar <id> --reel=<reel> --nombre=<nombre>\n`,
  );
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
if (command === "bajar") {
  const id = positional[0];
  const reel = flag("reel");
  const name = flag("nombre") ? slug(flag("nombre") as string) : "";
  if (!id || !/^\d+$/.test(id) || !reel || !name) {
    fail(
      "Uso: npm run stock -- bajar <id> --reel=<id-del-reel> --nombre=<nombre-del-clip> [--desde=0] [--duracion=10] [--centro=0.5]",
    );
  }
  const from = Number(flag("desde") ?? 0);
  const length = Math.min(30, Number(flag("duracion") ?? 10));
  const center = Math.min(1, Math.max(0, Number(flag("centro") ?? 0.5)));

  const video = await api<PexelsVideo>(`/videos/videos/${id}`);
  const files = video.video_files.filter((f) => f.file_type === "video/mp4");
  if (!files.length) fail("Ese video no tiene archivos mp4 disponibles.");

  // Vertical: el más cercano a 1080x1920 (o mayor). Horizontal: el 4K más chico (para que al recortar quede nítido).
  const portrait = files.filter((f) => f.height > f.width);
  const pick = portrait.length
    ? (portrait.filter((f) => f.height >= 1920).sort((a, b) => a.height - b.height)[0] ??
      portrait.sort((a, b) => b.height - a.height)[0])
    : (files.filter((f) => f.width >= 2160 && f.width <= 3840).sort((a, b) => a.width - b.width)[0] ??
      files.sort((a, b) => b.width - a.width)[0]);

  const outDir = join(root, "public", "reels", reel, "b-roll");
  mkdirSync(outDir, { recursive: true });
  const tmp = join(outDir, `.${name}.descarga.mp4`);
  const out = join(outDir, `${name}.mp4`);

  console.log(
    `\n→ Bajando ${video.id} (${pick.width}x${pick.height}, ${video.duration} s) de Pexels, autor: ${video.user.name}`,
  );
  const res = await fetch(pick.link);
  if (!res.ok || !res.body) fail(`No se pudo bajar el archivo (${res.status}).`);
  await pipeline(Readable.fromWeb(res.body as never), createWriteStream(tmp));
  console.log(`  descargado: ${(statSync(tmp).size / 1e6).toFixed(1)} MB`);

  // Recorte "cover" a 1080x1920, sin audio, 30 fps.
  const filter =
    "scale='if(gt(a,1080/1920),-2,1080)':'if(gt(a,1080/1920),1920,-2)'," +
    `crop=1080:1920:'(in_w-1080)*${center}':'(in_h-1920)/2'`;
  const r = ffmpeg([
    "-ss",
    String(from),
    "-t",
    String(length),
    "-i",
    tmp,
    "-an",
    "-vf",
    filter,
    "-r",
    "30",
    "-c:v",
    "libx264",
    "-crf",
    "20",
    "-preset",
    "medium",
    "-pix_fmt",
    "yuv420p",
    "-movflags",
    "+faststart",
    out,
  ]);
  if (r.status !== 0 || !existsSync(out)) {
    renameSync(tmp, out);
    console.warn(`⚠ No se pudo recortar (${(r.stderr || "").slice(-200)}). Se guardó el original sin recortar.`);
  } else {
    rmSync(tmp);
  }
  console.log(`✔ ${relative(root, out)} (${(statSync(out).size / 1e6).toFixed(1)} MB)`);

  // Créditos (la API de Pexels pide mencionar la fuente).
  const credits = join(outDir, "CREDITOS.md");
  if (!existsSync(credits))
    writeFileSync(
      credits,
      "# Créditos de B-roll\n\nVideos de Pexels (licencia Pexels: uso comercial permitido, atribución opcional).\n\n",
    );
  appendFileSync(credits, `- ${name}.mp4 — [${video.url}](${video.url}) · ${video.user.name} (${video.user.url})\n`);
  console.log(`  crédito registrado en ${relative(root, credits)}\n`);
  process.exit(0);
}

fail(
  'Comando desconocido. Usá:  npm run stock -- buscar "consulta"   o   npm run stock -- bajar <id> --reel=<reel> --nombre=<nombre>',
);
