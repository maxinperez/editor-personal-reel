# Reels de A&C — guía para Claude

Proyecto Remotion (1080×1920, 30 fps) que produce reels de Instagram de **A&C** (aycsociotech.com): soluciones tecnológicas a medida para pymes en Ventas, Administración y Marketing. Visión general y stack en `README.md`; uso detallado en `docs/guia.md`.

## Tono y texto

- Idioma: **español rioplatense con voseo** ("Agendá una charla", "usás"). Tono profesional y cercano, consultivo, sin tecnicismos ni promesas exageradas.
- Todo texto escrito (portadas, títulos, escenas, CTA, descripciones) en registro **profesional, sin jerga** aunque la voz la use ("implementar", no "meter").
- Excepción: los subtítulos copian la voz textual (`vo` sigue exactamente lo que se dice, con buena ortografía).

## Reglas del entorno (importante)

- La ruta local del proyecto contiene `&` (`...\A&C\...`). **Nunca uses `npx` ni los `.cmd` de `node_modules/.bin`**: Windows los rompe. Usá siempre `npm run <script>`; los scripts llaman a `node` directo. Para otros comandos de Remotion: `npm run remotion -- <comando>`.
- Los scripts en `scripts/` son TypeScript que Node ejecuta directo (type stripping, `"type": "module"`): solo sintaxis "borrable" (sin `enum`, `namespace` ni parameter properties), `import type` para tipos e imports relativos **con extensión** (`./x.ts`). Lo compartido (ROOT, `fail`, `parseArgs`, `loadReels`, `findVoice`, `ffmpeg`) está en `scripts/lib/common.ts`.
- Verificación antes de dar algo por terminado: `npm run lint` (ESLint + tsc) y `npm run vista -- <id>` (imágenes en `out/vista/`). Formato: `npm run format`.
- `npm install` en esta red a veces corta por timeout: usar `--maxsockets=4`.
- Repo público: voz, clips, transcripciones, `timing.json`, `out/`, `.whisper/`, `.env` y `referencias/` están en `.gitignore`. No mover material de terceros fuera de esas rutas.

## Cómo armar un reel nuevo a partir de un guion

1. Crear `src/reels/<id>.ts` (molde: `riesgo-ia.ts` para estilo editorial con B-roll, `por-que-a-medida.ts` para motion graphics) y registrarlo en `src/reels/index.ts`.
2. Dividir el guion en escenas. Cada escena tiene `vo` (lo que se dice, textual) y los campos visuales (más cortos que el `vo`). Elegir el tipo según la **intención** del tramo:
   - gancho → `broll` con `tag`, o `hook`
   - dolor del cliente → `points` con `tone: "bad"`, `sheet` (errores) o `broll`
   - por qué lo genérico no alcanza → `compare`
   - cómo funciona algo / proceso → `flow`
   - beneficios o servicios → `points` con `tone: "good"`
   - idea fuerte o remate → `statement` o `broll`
   - dato → `stat` (**solo datos reales**, con `source`; nunca inventar estadísticas)
   - foto/caso → `image` (con `prompt`) o `clip` (video del usuario; `sincronizado: true` si es su toma a cámara)
   - cierre → `cta`
3. Estructura que funciona: gancho en la primera escena (≤ 3 s), un solo mensaje por reel, cierre con una única acción.
4. En pantalla: máximo ~6-8 palabras por línea, máximo 5 ítems por lista, todo dentro de la zona segura (ya resuelto por los componentes; no sacar elementos de `ContentArea`).

## Voz y tiempos

- La voz va en `public/reels/<id>/voz.<ext>`: audio (mp3, wav, m4a, aac, ogg) o video del usuario (mp4, mov, webm). `npm run voz -- <id>` la transcribe con whisper.cpp 1.5.5 (modelo `small` por defecto) y escribe `timing.json` (tiempos por escena y por palabra, alineados con `vo`).
- Sincronía fina: se usa el tiempo DTW de cada palabra (`dtwMs`), corregido por su retraso medido en la misma grabación, y ajustado a las pausas del audio (`src/lib/snap.ts`).
- Revisar el % de reconocimiento y las palabras que Whisper escuchó distinto: si la voz difiere del guion, ajustar `vo` a lo que realmente se dice (y avisar al usuario).
- Si cambia cualquier `vo`, volver a correr `npm run voz` (usa la transcripción guardada). `calculateMetadata` y `npm run render` lo detectan por `scriptHash`.
- Sin voz, el reel usa tiempos estimados (`wordsPerSecond`).

## Estilo editorial y B-roll

- Especificación completa: `docs/estilo-editorial.md`. `captionStyle: "editorial"` + `*palabra*` en `vo` = palabra clave en serif cursiva grande; una por bloque; nunca conectores. `captionY` por escena.
- B-roll: `npm run stock -- buscar "..."` y `bajar <id> --reel= --nombre=` (Pexels; clave en `.env`, nunca en el chat ni en git). Mirar la hoja `out/stock/*.png` antes de elegir y evitar marcas, caras reconocibles y texto legible en otro idioma. Los clips quedan en `public/reels/<id>/b-roll/` a 1080×1920 sin audio; documentarlos en un `LEEME.md` de esa carpeta (sí se versiona).
- Material: `docs/material-y-licencias.md`. **No usar clips de películas/series ni descargar de YouTube/streaming.**
- Looks de color compartidos en `src/lib/look.ts`. No hardcodear colores: usar `COLORS` de `src/brand.ts`.

## Portadas

- `src/covers/index.ts` (datos) + `src/covers/Portada.tsx`. Estilo elegido por el usuario: `titular`. `fondo` puede ser un clip del B-roll + `segundo`. `npm run portadas` → `out/portadas/<id>.png` y `<id>-3x4.png`. Todo lo importante dentro de la franja 3:4 (y 240–1680).

## Imágenes con IA

- Escena `image` con `src` y `prompt`; `npm run prompts -- <id>` lista prompts + estilo de marca + ruta. Estilo: fotográfico editorial, luz natural, azul marino (`#1F345B`) y verde menta (`#6CC7A8`), sin texto ni logos.

## Agregar un tipo de escena

Tipo en `src/types.ts` → componente en `src/scenes/` → caso en `src/scenes/index.tsx` → ejemplo en `src/reels/catalogo.ts`.

## Material local (no está en el repo)

`referencias/` guarda los dos videos de referencia (`ref1.mov`, `ref2.mov`) y los informes originales; el resumen publicable está en `docs/`.
