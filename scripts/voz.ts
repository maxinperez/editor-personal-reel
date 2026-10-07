// Procesa tu voz: la transcribe en tu PC (Whisper, sin internet ni APIs de pago), la cruza con el guion
// y guarda cuándo empieza cada escena y cuándo se dice cada palabra en public/reels/<id>/timing.json.
//
//   npm run voz -- <id-del-reel>               (ej. npm run voz -- riesgo-ia)
//   npm run voz -- <id> --modelo=base          (más rápido y menos preciso; por defecto "small")
//   npm run voz -- <id> --forzar               (vuelve a transcribir aunque la voz no haya cambiado)
//
// La voz es public/reels/<id>/voz.<ext>: audio (mp3, wav, m4a, aac, ogg) o un video tuyo (mp4, mov, webm).

import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
  type WhisperModel,
} from "@remotion/install-whisper-cpp";
import type { Heard } from "../src/lib/align.ts";
import { dtwLag, findSilences, snapToSpeech } from "../src/lib/snap.ts";
import { timingFromHeard } from "../src/lib/timing.ts";
import { fail, ffmpeg, findVoice, loadReels, parseArgs, requireReel, ROOT, VOICE_EXTENSIONS } from "./lib/common.ts";

const WHISPER_VERSION = "1.5.5"; // última versión con binarios oficiales para Windows (soporta DTW)
const SAMPLE_RATE = 16000; // lo que pide Whisper
process.chdir(ROOT); // el instalador de whisper.cpp trabaja relativo a la carpeta actual

const args = parseArgs();
const model = (args.flag("modelo") ?? "small") as WhisperModel;
const force = args.flag("forzar") !== undefined;
const reel = requireReel(await loadReels(), args.positional[0], "voz");

const voiceFile = findVoice(reel.id);
if (!voiceFile) {
  fail(
    `No encuentro tu voz. Guardá la grabación como:\n` +
      `  public/reels/${reel.id}/voz.m4a   (sirve ${VOICE_EXTENSIONS.map((e) => "." + e).join(", ")})`,
  );
}
const voicePath = join(ROOT, "public", voiceFile);
const transcriptFile = join(dirname(voicePath), "transcript.json");
const timingFile = join(dirname(voicePath), "timing.json");

// Todo lo de Whisper vive en .whisper/. El programa va en su propia subcarpeta, que NO hay que crear
// antes: si la carpeta ya existe, el instalador da por hecho que está instalado y no baja nada.
const whisperDir = join(ROOT, ".whisper", "cpp");
const modelsDir = join(ROOT, ".whisper", "models");
const workDir = join(ROOT, ".whisper", "work");
mkdirSync(modelsDir, { recursive: true });
mkdirSync(workDir, { recursive: true });

/** Pasa la voz (audio o video) a WAV 16 kHz mono y devuelve sus muestras. */
const toWav = (): { wavPath: string; pcm: Int16Array; audioMs: number } => {
  const wavPath = join(workDir, `${reel.id}.wav`);
  const res = ffmpeg(["-i", voicePath, "-vn", "-ar", String(SAMPLE_RATE), "-ac", "1", "-c:a", "pcm_s16le", wavPath]);
  if (res.status !== 0 || !existsSync(wavPath)) {
    fail(`No pude leer el audio de ${voiceFile}.\n${(res.stderr || "").slice(-800)}`);
  }
  const wav = readFileSync(wavPath);
  const at = wav.indexOf("data") + 8; // las muestras empiezan después del encabezado WAV
  const end = wav.length - ((wav.length - at) % 2);
  const pcm = new Int16Array(wav.buffer.slice(wav.byteOffset + at, wav.byteOffset + end));
  return { wavPath, pcm, audioMs: Math.round((pcm.length / SAMPLE_RATE) * 1000) };
};

type Transcript = { audioMtime: number; model: string; audioMs: number; heard: Heard[] };

const loadCache = (): Transcript | null => {
  if (force || !existsSync(transcriptFile)) return null;
  const t = JSON.parse(readFileSync(transcriptFile, "utf8")) as Transcript;
  const hasDtw = t.heard.some((h) => h.dtwMs !== undefined); // las transcripciones viejas no lo traen
  return hasDtw && t.model === model && t.audioMtime === statSync(voicePath).mtimeMs ? t : null;
};

const transcribeVoice = async (wavPath: string, audioMs: number): Promise<Transcript> => {
  console.log(`\n→ Preparando Whisper (${model}). La primera vez descarga el programa y el modelo; después no.`);
  // Una instalación cortada a medias deja la carpeta sin el programa: se borra para reintentar limpia.
  const exe = join(whisperDir, process.platform === "win32" ? "main.exe" : "main");
  if (existsSync(whisperDir) && !existsSync(exe)) rmSync(whisperDir, { recursive: true, force: true });
  await installWhisperCpp({ to: whisperDir, version: WHISPER_VERSION, printOutput: false });
  if (!existsSync(exe)) {
    fail(`No se instaló Whisper correctamente (falta ${relative(ROOT, exe)}). Borrá la carpeta .whisper y reintentá.`);
  }
  await downloadWhisperModel({
    model,
    folder: modelsDir,
    printOutput: false,
    onProgress: (done, total) => {
      process.stdout.write(`\r  Descargando modelo: ${Math.round((done / total) * 100)}%   `);
    },
  });
  process.stdout.write("\n");

  console.log("→ Transcribiendo tu voz…");
  const output = await transcribe({
    model,
    whisperPath: whisperDir,
    modelFolder: modelsDir,
    whisperCppVersion: WHISPER_VERSION,
    inputPath: wavPath,
    tokenLevelTimestamps: true, // activa DTW: el momento real en que se dice cada fragmento
    language: "es",
    printOutput: false,
  });

  // Whisper entrega fragmentos de palabra: los que no empiezan con espacio se pegan a la palabra anterior.
  // `timestampMs` (DTW) es cuándo se dice de verdad el fragmento; `startMs`/`endMs` son mucho menos precisos.
  const heard: Heard[] = [];
  for (const c of toCaptions({ whisperCppOutput: output }).captions) {
    const text = c.text.trim();
    if (!text || /^\[.*\]$/.test(text) || /^\(.*\)$/.test(text) || /^[♪\s]+$/.test(text)) continue;
    const last = heard[heard.length - 1];
    if (!last || /^\s/.test(c.text)) {
      heard.push({ text, startMs: c.startMs, endMs: c.endMs, dtwMs: c.timestampMs ?? undefined });
    } else {
      last.text += text;
      last.endMs = c.endMs;
    }
  }

  const transcript: Transcript = { audioMtime: statSync(voicePath).mtimeMs, model, audioMs, heard };
  writeFileSync(transcriptFile, JSON.stringify(transcript, null, 2));
  return transcript;
};

const { wavPath, pcm, audioMs } = toWav();
const cached = loadCache();
if (cached) console.log("→ Uso la transcripción guardada (la voz no cambió). Para rehacerla: --forzar");
const transcript = cached ?? (await transcribeVoice(wavPath, audioMs));

// Los tiempos de Whisper se corren a donde realmente empieza y termina la voz (ver src/lib/snap.ts).
const silences = findSilences(pcm, SAMPLE_RATE);
const heard = snapToSpeech(transcript.heard, silences);
console.log(
  `→ Tiempos ajustados a la voz: ${silences.length} pausas detectadas, corrección DTW ${dtwLag(transcript.heard, silences)} ms.`,
);

const timing = timingFromHeard(reel, heard, { audioMs: transcript.audioMs, audioFile: voiceFile });
writeFileSync(timingFile, JSON.stringify(timing, null, 2));

// Resumen para que veas si los tiempos tienen sentido.
const sec = (ms: number) => (ms / 1000).toFixed(1).padStart(5);
console.log(`\n✔ ${relative(ROOT, timingFile)}`);
console.log(
  `  Duración: ${(timing.durationMs / 1000).toFixed(1)} s · palabras reconocidas del guion: ${Math.round((timing.matchRate ?? 0) * 100)}%\n`,
);
reel.scenes.forEach((s, i) => {
  const t = timing.scenes[i];
  console.log(
    `  ${String(i + 1).padStart(2)}. ${sec(t.startMs)}s → ${sec(t.endMs)}s  ${s.type.padEnd(9)} ${s.vo.slice(0, 48)}`,
  );
});
if ((timing.matchRate ?? 0) < 0.7) {
  console.log(
    "\n⚠ Se reconoció menos del 70% del guion: probablemente la voz no sigue el texto de `vo`.\n" +
      '  Revisá el guion. Si improvisás, usá captionsFrom: "voz" en el guion.',
  );
}
console.log("\nListo. Abrí Studio (npm run dev) y recargá el reel para verlo sincronizado.\n");
