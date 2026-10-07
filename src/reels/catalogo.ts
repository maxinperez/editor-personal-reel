import type { Reel } from "../types.ts";

/**
 * CATÁLOGO — una escena de cada tipo, para ver qué se puede hacer y copiar el formato.
 * No es para publicar: los datos son de ejemplo.
 */
export default {
  id: "catalogo",
  title: "Catálogo de escenas (no publicar)",
  scenes: [
    {
      type: "hook",
      text: "Esto es un *gancho*",
      vo: "Escena gancho: la frase que frena el scroll.",
    },
    {
      type: "statement",
      text: "Una frase para *pensar*",
      sub: "Con una línea de apoyo debajo",
      vo: "Escena frase: ideal para una idea fuerte.",
    },
    {
      type: "points",
      title: "Lista de puntos",
      items: [
        { icon: "users", text: "Primer punto", sub: "Con detalle opcional" },
        { icon: "zap", text: "Segundo punto", tone: "good" },
        { icon: "alert", text: "Un problema", tone: "bad" },
        { icon: "rocket", text: "Cuarto punto" },
      ],
      vo: "Escena de puntos: tarjetas con ícono que entran una por una.",
    },
    {
      type: "compare",
      left: { title: "Antes", items: ["Todo manual", "Datos dispersos"] },
      right: { title: "Después", items: ["Todo automático", "Datos centralizados"] },
      vo: "Escena de comparación: antes contra después.",
    },
    {
      type: "flow",
      title: "Un proceso",
      steps: [
        { icon: "phone", label: "Primer paso" },
        { icon: "workflow", label: "Segundo paso" },
        { icon: "check", label: "Resultado" },
      ],
      outcome: "Todo conectado",
      vo: "Escena de flujo: muestra cómo funciona un proceso.",
    },
    {
      type: "stat",
      value: 87,
      suffix: "%",
      label: "Dato de ejemplo",
      sub: "Reemplazar por un dato real",
      source: "tu fuente",
      vo: "Escena de dato: un número real, siempre con su fuente.",
    },
    {
      type: "image",
      src: "reels/catalogo/imagen.png",
      prompt: "Oficina moderna con equipo trabajando frente a pantallas, luz cálida, estilo fotográfico",
      headline: "Imagen a pantalla completa",
      vo: "Escena de imagen: generada con inteligencia artificial o propia.",
    },
    {
      type: "broll",
      tag: "Etiqueta fija",
      grade: "cine",
      clips: [{ src: "reels/catalogo/b-roll-1.mp4" }, { src: "reels/catalogo/b-roll-2.mp4" }],
      vo: "Escena de B-roll: varios clips en cortes secos, con un tinte de marca.",
    },
    {
      type: "sheet",
      title: "ejemplo.xlsx",
      columns: ["Cliente", "Estado", "Monto"],
      rows: [
        ["Cliente 001", "Activo", "$ 10.000"],
        ["Cliente 002", "Activo", "$ 20.000"],
        ["Cliente 003", "Pendiente", "$ 30.000"],
      ],
      errors: [{ row: 1, col: 2, label: "#REF!" }],
      alert: { title: "Alerta de ejemplo", text: "Mensaje de apoyo" },
      vo: "Escena de planilla: celdas que fallan y una alerta.",
    },
    {
      type: "clip",
      src: "reels/catalogo/clip.mp4",
      headline: "Tu propio video",
      vo: "Escena de video: sirve para grabaciones tuyas, de cámara o de pantalla.",
    },
    {
      type: "cta",
      headline: "Llamada a la *acción*",
      sub: "Con tu marca y tu enlace",
      vo: "Escena final: marca y llamada a la acción.",
    },
  ],
} satisfies Reel;
