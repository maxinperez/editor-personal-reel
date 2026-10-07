// Tipos del guion de un reel. Todo lo que escribas en src/reels/*.ts se valida contra esto.
// Importante: este archivo solo tiene tipos, así lo pueden leer tanto Remotion como los scripts de Node.

import type { LookName } from "./lib/look.ts";

export type IconName =
  | "chart-up"
  | "chart"
  | "users"
  | "clock"
  | "hourglass"
  | "chat"
  | "mail"
  | "phone"
  | "zap"
  | "settings"
  | "wrench"
  | "file"
  | "table"
  | "receipt"
  | "cart"
  | "package"
  | "database"
  | "workflow"
  | "layers"
  | "puzzle"
  | "bot"
  | "target"
  | "check"
  | "x"
  | "alert"
  | "shield"
  | "megaphone"
  | "rocket"
  | "handshake"
  | "calendar"
  | "search"
  | "idea"
  | "building"
  | "arrow";

export type Tone = "bad" | "good" | "neutral";

type SceneBase = {
  /**
   * Lo que se DICE durante esta escena, tal cual lo vas a leer en voz alta.
   * Con tu grabación, de acá salen los tiempos de cada escena y los subtítulos.
   */
  vo: string;
  /** Ocultar subtítulos durante esta escena (ej. cuando ya hay mucho texto en pantalla). */
  hideCaptions?: boolean;
  /** Estilo editorial: altura del centro del bloque de subtítulos, en % del alto del cuadro (por defecto 54). */
  captionY?: number;
};

/** Frase de gancho, enorme. Envolvé palabras en *asteriscos* para resaltarlas. */
export type HookScene = SceneBase & {
  type: "hook";
  text: string;
  kicker?: string;
};

/** Frase grande en serif, con revelado palabra por palabra. */
export type StatementScene = SceneBase & {
  type: "statement";
  text: string;
  sub?: string;
};

/** Lista de tarjetas con ícono. */
export type PointsScene = SceneBase & {
  type: "points";
  title?: string;
  items: { icon: IconName; text: string; sub?: string; tone?: Tone }[];
};

/** Dos paneles enfrentados: "lo genérico" vs "lo tuyo". */
export type CompareSide = { title: string; items: string[] };
export type CompareScene = SceneBase & {
  type: "compare";
  left: CompareSide;
  right: CompareSide;
};

/** Pasos conectados verticalmente, con un pulso que recorre el proceso. */
export type FlowScene = SceneBase & {
  type: "flow";
  title?: string;
  steps: { icon: IconName; label: string }[];
  outcome?: string;
  /** Reparte la aparición de los pasos a lo largo de toda la escena (para acompañar una frase larga). */
  spread?: boolean;
};

/** Un número grande que cuenta hasta su valor. Usá solo datos reales y citá la fuente. */
export type StatScene = SceneBase & {
  type: "stat";
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  sub?: string;
  source?: string;
  /** 0 a 1. Si no se indica y el sufijo es "%", usa value/100. */
  progress?: number;
};

/** Imagen a pantalla completa (generada con IA o tuya) con movimiento suave. */
export type ImageScene = SceneBase & {
  type: "image";
  /** Ruta dentro de public/, ej. "reels/mi-reel/escena-3.png" */
  src: string;
  /** Prompt para generar la imagen (se muestra en Studio mientras falta el archivo). */
  prompt?: string;
  headline?: string;
  motion?: "in" | "out" | "left" | "right";
};

/** Video tuyo (grabado con el celu, b-roll, etc.) a pantalla completa. */
export type ClipScene = SceneBase & {
  type: "clip";
  /** Ruta dentro de public/, ej. "reels/mi-reel/camara.mp4" */
  src: string;
  startFromSec?: number;
  /**
   * El video es tu grabación completa hablando a cámara (la misma toma que la voz, ej. "reels/mi-reel/voz.mp4"):
   * se muestra justo el tramo de esta escena, en sincronía con lo que decís. Ignora `startFromSec`.
   */
  sincronizado?: boolean;
  headline?: string;
  /** Reproducir el audio del clip (por defecto va silenciado y suena tu voz en off). */
  withAudio?: boolean;
};

/** Un clip de B-roll dentro de una escena `broll`. */
export type BrollClip = {
  /** Ruta dentro de public/, ej. "reels/mi-reel/b-roll/oficina-1.mp4" */
  src: string;
  startFromSec?: number;
  /** Movimiento lento: "in" (acerca), "out" (aleja) o "none". Por defecto alterna. */
  zoom?: "in" | "out" | "none";
  /** Peso relativo de duración dentro de la escena (por defecto 1). */
  weight?: number;
};

/**
 * Varios clips en cortes secos, repartidos a lo largo de la escena (idealmente cada 2-3 s),
 * con un tinte de marca para que todo el material se vea parejo.
 */
export type BrollScene = SceneBase & {
  type: "broll";
  clips: BrollClip[];
  /** Etiqueta fija arriba, ej. "NADIE TE CUENTA ESTO". */
  tag?: string;
  /** Look del material: "cine" (oscuro, contrastado), "frio", "calido" o "ninguno". */
  grade?: LookName;
};

/** Planilla de ejemplo con celdas que fallan y una alerta (para hablar de errores y riesgos). */
export type SheetScene = SceneBase & {
  type: "sheet";
  /** Nombre del archivo en la barra superior, ej. "clientes.xlsx". */
  title: string;
  columns: string[];
  rows: string[][];
  errors: { row: number; col: number; label: string }[];
  alert?: { title: string; text: string };
};

/** Cierre: marca + llamada a la acción. */
export type CtaScene = SceneBase & {
  type: "cta";
  headline: string;
  sub?: string;
  /** Por defecto, la URL de BRAND. */
  url?: string;
};

export type Scene =
  | HookScene
  | StatementScene
  | PointsScene
  | CompareScene
  | FlowScene
  | StatScene
  | ImageScene
  | ClipScene
  | BrollScene
  | SheetScene
  | CtaScene;

export type Reel = {
  /** Identificador único, en minúsculas y con guiones. Es el nombre del archivo de salida. */
  id: string;
  /** Nombre interno para reconocerlo en Studio. */
  title: string;
  /** Para qué existe este reel (solo orientativo; guía el tono y los prompts de imágenes). */
  objetivo?: string;
  /** Música de fondo opcional. */
  music?: { src: string; volume?: number };
  /** Subtítulos animados. Por defecto true. */
  captions?: boolean;
  /**
   * De dónde sale el texto de los subtítulos:
   * - "guion": el texto exacto de `vo` (ortografía perfecta). Por defecto.
   * - "voz": lo que Whisper escuchó (para cuando improvisás sin guion).
   */
  captionsFrom?: "guion" | "voz";
  /**
   * Aspecto de los subtítulos:
   * - "clasico": 4 palabras por tarjeta, la activa en verde (por defecto).
   * - "editorial": palabras que se acumulan en sans negrita y una palabra clave en serif cursiva grande
   *   (marcala con *asteriscos* en `vo`).
   */
  captionStyle?: "clasico" | "editorial";
  /** Ritmo de habla previsto, en palabras por segundo, para estimar tiempos antes de grabar (por defecto 2,7). */
  wordsPerSecond?: number;
  scenes: Scene[];
};

export type Word = {
  text: string;
  startMs: number;
  endMs: number;
  /** Palabra de énfasis (marcada con *asteriscos* en el guion). */
  em?: boolean;
};

export type Timing = {
  source: "audio" | "estimado";
  /** Archivo de voz (ruta dentro de public/), detectado por `npm run voz`. */
  audioFile?: string;
  /** Huella del guion con el que se calculó. Si cambiás un `vo`, hay que volver a correr `npm run voz`. */
  scriptHash: string;
  durationMs: number;
  words: Word[];
  scenes: { startMs: number; endMs: number }[];
  /** Porcentaje (0-1) de palabras del guion que se reconocieron en la voz. */
  matchRate?: number;
};

/** Props que recibe la composición una vez calculados los metadatos. */
export type ReelProps = {
  reel: Reel;
  timing: Timing;
  /** Qué archivos de public/ referenciados por el guion existen realmente. */
  assets: Record<string, boolean>;
};
