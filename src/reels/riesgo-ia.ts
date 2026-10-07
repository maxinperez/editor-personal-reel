import type { Reel } from "../types.ts";

/**
 * REEL — "El riesgo que nadie te cuenta de la IA"  (~43 s a ritmo tranquilo)
 *
 * Estilo editorial (ver referencias/ESTILO-REFERENCIA.md): la atención la llevan las imágenes, los cortes
 * cada 2-3 s y los subtítulos; la voz es calma.
 *
 *  - `vo`: lo que se dice, escrito con la ortografía correcta (los subtítulos muestran este mismo texto).
 *  - *palabra*: se muestra grande en serif cursiva.
 *  - B-roll: clips de stock con licencia (Pexels) en public/reels/riesgo-ia/b-roll/. Se bajan con
 *    `npm run stock` (ver README).
 *
 * Voz: guardala como public/reels/riesgo-ia/voz.mp3 y corré `npm run voz -- riesgo-ia`.
 */
const B = "reels/riesgo-ia/b-roll";

export default {
  id: "riesgo-ia",
  title: "El riesgo que nadie te cuenta de la IA",
  objetivo:
    "Advertir a dueños y gerentes de empresas que implementar IA por moda es riesgoso, y ofrecer un diagnóstico previo.",
  captionStyle: "editorial",
  wordsPerSecond: 2.9,
  scenes: [
    {
      // 1 · Gancho
      type: "broll",
      tag: "Nadie te cuenta esto",
      grade: "cine",
      clips: [{ src: `${B}/frustrado-1.mp4` }, { src: `${B}/frustrado-2.mp4` }],
      vo: "*Esperá.* *Esperá.* Antes de meter *IA* en tu empresa, escuchá esto.",
    },
    {
      // 2 · Problema
      type: "broll",
      grade: "cine",
      clips: [{ src: `${B}/reunion-1.mp4` }, { src: `${B}/reunion-2.mp4` }, { src: `${B}/reunion-3.mp4` }],
      vo: "Hoy todos dicen que la IA es la *solución*. Pero implementarla solo porque está de *moda* puede salir *carísimo*.",
    },
    {
      // 3 · Riesgo (a): planilla que falla y alerta de datos
      type: "sheet",
      title: "clientes.xlsx",
      columns: ["Cliente", "Estado", "Monto"],
      rows: [
        ["Cliente 014", "Activo", "$ 84.200"],
        ["Cliente 015", "Activo", "$ 12.900"],
        ["Cliente 016", "Pendiente", "$ 45.300"],
        ["Cliente 017", "Activo", "$ 7.800"],
        ["Cliente 018", "Activo", "$ 51.000"],
      ],
      errors: [
        { row: 1, col: 2, label: "#REF!" },
        { row: 2, col: 1, label: "duplicado" },
        { row: 3, col: 2, label: "#N/D" },
      ],
      alert: { title: "Datos de clientes expuestos", text: "Acceso no autorizado detectado" },
      captionY: 74,
      vo: "Una mala implementación puede *romper* procesos que funcionan, exponer los *datos* de tus clientes",
    },
    {
      // 3 · Riesgo (b)
      type: "broll",
      grade: "frio",
      clips: [{ src: `${B}/tiempo-1.mp4` }, { src: `${B}/tiempo-2.mp4` }],
      vo: "y hasta hacerte perder *tiempo* y *plata*.",
    },
    {
      // 4 · Solución (a)
      type: "broll",
      grade: "calido",
      clips: [{ src: `${B}/pizarra-1.mp4` }, { src: `${B}/pizarra-2.mp4` }],
      vo: "Por eso, primero hace falta un *diagnóstico*:",
    },
    {
      // 4 · Solución (b): los tres pasos del diagnóstico, uno por frase
      type: "flow",
      spread: true,
      steps: [
        { icon: "layers", label: "Qué procesos tenés" },
        { icon: "target", label: "Dónde está el problema real" },
        { icon: "idea", label: "¿Necesitás IA u otra herramienta?" },
      ],
      hideCaptions: true,
      vo: "qué procesos tenés, dónde está el problema real y si de verdad necesitás IA u otra herramienta.",
    },
    {
      // 5 · Cierre de idea
      type: "broll",
      grade: "cine",
      clips: [{ src: `${B}/decision-1.mp4` }, { src: `${B}/decision-2.mp4` }],
      vo: "La IA no es un *capricho*. Es una *herramienta*, y tiene que resolver algo *concreto*.",
    },
    {
      // 6 · Llamada a la acción
      type: "cta",
      headline: "Seguime y escribime por *privado*",
      sub: "Sin ningún compromiso",
      hideCaptions: true,
      vo: "Si querés saber más cómo aprovechar la IA en tu empresa, seguime y escribime por privado. Sin ningún compromiso.",
    },
  ],
} satisfies Reel;
