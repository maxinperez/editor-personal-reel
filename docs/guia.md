# Guía de uso

Todo lo que hace falta para armar un reel de punta a punta. Para la visión general, ver el [README](../README.md).

## 1. El guion

Un reel es un archivo TypeScript en `src/reels/<id>.ts`, registrado en `src/reels/index.ts`. Es solo datos:
una lista de escenas. Cada escena tiene dos textos:

- `vo`: lo que **decís** en esa escena, tal cual. De acá salen los tiempos y el texto de los subtítulos.
  Escribilo con buena ortografía: los subtítulos lo muestran así.
- el resto de los campos: lo que **se ve** en pantalla (más corto que lo que decís).

```ts
import type { Reel } from "../types.ts";

export default {
  id: "mi-reel",
  title: "Mi reel",
  captionStyle: "editorial", // subtítulos sans + palabra clave en serif cursiva
  scenes: [
    {
      type: "broll",
      tag: "Nadie te cuenta esto",
      clips: [{ src: "reels/mi-reel/b-roll/oficina-1.mp4" }, { src: "reels/mi-reel/b-roll/oficina-2.mp4" }],
      vo: "Antes de implementar *IA* en tu empresa, escuchá esto.",
    },
    {
      type: "cta",
      headline: "Escribime por *privado*",
      hideCaptions: true,
      vo: "Si querés saber más, escribime por privado.",
    },
  ],
} satisfies Reel;
```

En `vo`, la palabra entre `*asteriscos*` es la palabra clave del subtítulo (serif cursiva grande). En los
campos visuales, `*asteriscos*` resalta con el color de acento.

Hay tres reels de ejemplo: `riesgo-ia` (estilo editorial con B-roll), `por-que-a-medida` (motion graphics) y
`catalogo` (una escena de cada tipo, para copiar el formato; no se publica).

## 2. Tipos de escena

| `type`      | Para qué sirve                                                       | Campos principales                                                 |
| ----------- | -------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `hook`      | Frase de gancho enorme                                               | `text`, `kicker?`                                                  |
| `statement` | Idea fuerte en serif, revelada palabra por palabra                   | `text`, `sub?`                                                     |
| `points`    | Lista de tarjetas con ícono (hasta 5)                                | `title?`, `items[{icon,text,sub?,tone?}]`                          |
| `compare`   | Antes vs. después, genérico vs. a medida                             | `left`, `right` (`title`, `items[]`)                               |
| `flow`      | Proceso paso a paso                                                  | `title?`, `steps[{icon,label}]`, `outcome?`, `spread?`             |
| `stat`      | Número que cuenta hasta su valor (**solo datos reales, con fuente**) | `value`, `suffix?`, `label`, `source?`                             |
| `image`     | Imagen a pantalla completa con movimiento lento                      | `src`, `prompt?`, `headline?`, `motion?`                           |
| `clip`      | Video propio a pantalla completa                                     | `src`, `startFromSec?`, `sincronizado?`, `headline?`, `withAudio?` |
| `broll`     | Varios clips en cortes secos, con look de color                      | `clips[{src,startFromSec?,zoom?,weight?}]`, `tag?`, `grade?`       |
| `sheet`     | Planilla animada con errores y una alerta                            | `title`, `columns`, `rows`, `errors[]`, `alert?`                   |
| `cta`       | Cierre con marca y llamada a la acción                               | `headline`, `sub?`, `url?`                                         |

Todas aceptan `hideCaptions: true` (ocultar subtítulos en esa escena) y `captionY` (altura de los subtítulos
editoriales, en % del alto). Los íconos disponibles están en `IconName` (`src/types.ts`). `tone` en `points`:
`"bad"` (coral), `"good"` (verde) o neutro.

## 3. Clips de stock (Pexels)

1. Creá una cuenta gratuita en pexels.com, pedí la clave en <https://www.pexels.com/api/> y copiá
   `.env.example` como `.env` con tu clave.
2. Buscar (arma una hoja de miniaturas en `out/stock/`):
   ```bash
   npm run stock -- buscar "persona frustrada frente a la computadora"
   ```
3. Bajar uno, ya recortado a 1080×1920 y sin audio:
   ```bash
   npm run stock -- bajar 1234567 --reel=mi-reel --nombre=frustrado-1
   ```
   Opciones: `--desde=<seg>`, `--duracion=<seg>` (máx. 30) y `--centro=0..1` (qué parte del cuadro horizontal
   se conserva). Los créditos quedan en `public/reels/<id>/b-roll/CREDITOS.md`.

También podés bajar los clips a mano desde la web y guardarlos en `public/reels/<id>/b-roll/`.

## 4. La voz

Guardá la grabación como `public/reels/<id>/voz.<ext>`:

- **Voz en off:** `mp3`, `wav`, `m4a`, `aac` u `ogg`.
- **Video tuyo hablando a cámara:** `mp4`, `mov` o `webm`. Se usa su audio como voz y, si querés mostrarte,
  agregá escenas `clip` con `src: "reels/<id>/voz.mp4"` y `sincronizado: true`: cada una muestra justo el tramo
  en que decís su `vo`.

Después:

```bash
npm run voz -- mi-reel
```

Transcribe la voz en tu PC con Whisper (la primera vez descarga el programa y el modelo, ~470 MB), la cruza
con el guion y guarda `timing.json`: cuándo empieza cada escena y cuándo se dice cada palabra. Opciones:
`--modelo=base` (más rápido, menos preciso) y `--forzar` (volver a transcribir).

Tips:

- El texto de `vo` tiene que coincidir con lo que decís. El comando muestra qué porcentaje del guion
  reconoció; si es bajo, revisá las diferencias. Si improvisás, usá `captionsFrom: "voz"` en el reel.
- Si cambiás un `vo` después, volvé a correr `npm run voz` (usa la transcripción guardada y tarda segundos).
- Grabá en un lugar silencioso; recortar silencios largos al principio y al final ayuda.

## 5. Revisar y exportar

```bash
npm run dev                    # Remotion Studio: vista previa interactiva
npm run vista -- mi-reel       # una imagen por escena en out/vista/
npm run render -- mi-reel      # out/mi-reel.mp4
```

Sin voz procesada, el reel usa tiempos estimados (`wordsPerSecond`, 2,7 por defecto) para poder armarlo antes
de grabar. El render avisa si la voz no está procesada o si el guion cambió desde entonces.

El MP4 sale en H.264 + AAC, 1080×1920, 30 fps. Un reel de 40 s con clips 4K tarda unos 7 minutos.

## 6. Portadas

Las portadas se definen en `src/covers/index.ts`:

```ts
{
  id: "mi-reel",
  estilo: "titular",                          // "titular" | "foto" | "tipografica"
  fondo: "reels/mi-reel/b-roll/oficina-1.mp4", // imagen o video de public/
  segundo: 1,                                 // si es video: qué cuadro se usa
  etiqueta: "Nadie te cuenta esto",
  titulo: "Antes de implementar\n*IA*\nen tu empresa…", // un renglón por línea; *renglón* = serif grande
  acento: "coral",                            // "coral" (riesgos) o "mint" (soluciones)
}
```

```bash
npm run portadas               # out/portadas/<id>.png (para subir) y <id>-3x4.png (cómo se ve en el perfil)
```

El perfil de Instagram muestra el centro de la portada en 3:4 (de y=240 a y=1680 sobre 1920): todo lo
importante va ahí. Texto de portada siempre en registro profesional.

## 7. Imágenes generadas con IA

Las escenas gráficas se dibujan con código. Para fotos o ilustraciones: escena `image` con un `prompt`, y
`npm run prompts -- <id>` lista cada prompt (con el estilo de marca agregado) y dónde guardar la imagen.
Mientras falte el archivo, Studio muestra un recuadro "Imagen pendiente".

## 8. Música

Opcional. Lo más simple es agregarla al publicar, desde la colección de sonidos para empresas de Instagram.
Si querés que vaya en el MP4: copiá una pista con licencia a `public/musica/` y sumá al reel
`music: { src: "musica/fondo.mp3", volume: 0.1 }`.

## 9. Marca y diseño

- `src/brand.ts`: nombre, URL, llamada a la acción, colores y logo.
- `src/theme.ts`: tipografías, tamaño del cuadro y zonas seguras de Instagram (arriba ~230 px y abajo ~340 px
  quedan tapados por la interfaz de la app).
- `src/lib/look.ts`: looks de color del material filmado.
- [Estilo editorial](estilo-editorial.md): especificación de los subtítulos y del montaje.

## 10. Agregar un tipo de escena

Tipo en `src/types.ts` → componente en `src/scenes/` → caso en `src/scenes/index.tsx` → ejemplo en
`src/reels/catalogo.ts`. Verificá con `npm run lint` y `npm run vista -- catalogo`.

## 11. Problemas comunes

- **`npx` falla o "no se reconoce como comando" en Windows:** si la ruta de la carpeta tiene `&` u otros
  símbolos, Windows rompe `npx`. Usá siempre `npm run …` (los scripts ya llaman a `node` directo).
- **`npm install` se corta por timeout:** `npm install --maxsockets=4`.
- **"Cambiaste el texto (vo)…":** volvé a correr `npm run voz -- <id>`.
- **La instalación de Whisper quedó a medias:** borrá la carpeta `.whisper/` y volvé a correr `npm run voz`.
- **Errores 404 en la consola de Studio:** faltan archivos (voz, clips, imágenes); las escenas muestran qué falta.
