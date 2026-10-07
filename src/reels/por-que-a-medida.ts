import type { Reel } from "../types.ts";

/**
 * REEL 1 — "Por qué tu empresa necesita tecnología a medida"
 *
 * Es un borrador armado con lo que dice aycsociotech.com. Reemplazá los textos por tu guion real:
 *  - `vo`  = lo que vas a decir en voz alta en esa escena (de acá salen tiempos y subtítulos).
 *  - el resto de los campos = lo que se ve en pantalla (más corto que lo que decís).
 *  - *asteriscos* resaltan palabras.
 *
 * Estructura: gancho → problema → contraste → solución → áreas → remate → llamada a la acción.
 *
 * Para usar tu voz: guardá la grabación como public/reels/por-que-a-medida/voz.mp3 (o .wav / .m4a) y corré
 *   npm run voz -- por-que-a-medida
 */
export default {
  id: "por-que-a-medida",
  title: "Por qué tu empresa necesita tecnología a medida",
  objetivo:
    "Mostrar a dueños y gerentes de pymes que un sistema genérico los frena, y que A&C construye soluciones a medida en ventas, administración y marketing.",
  scenes: [
    {
      type: "hook",
      text: "Tu empresa *no* es genérica",
      vo: "Tu empresa no es genérica. ¿Por qué usás un sistema genérico?",
    },
    {
      type: "points",
      title: "¿Te suena?",
      items: [
        { icon: "table", text: "Planillas sueltas", tone: "bad" },
        { icon: "layers", text: "Datos desordenados", tone: "bad" },
        { icon: "clock", text: "Tareas repetidas a mano", tone: "bad" },
      ],
      vo: "Planillas sueltas, datos desordenados, tareas repetidas a mano. Eso te cuesta tiempo y ventas.",
    },
    {
      type: "compare",
      left: {
        title: "Software genérico",
        items: ["Te obliga a adaptarte", "Funciones que no usás", "Procesos a medias"],
      },
      right: {
        title: "A medida",
        items: ["Se adapta a tu forma de trabajar", "Solo lo que necesitás", "Procesos completos"],
      },
      vo: "Un software genérico te obliga a trabajar como él quiere. Uno a medida trabaja como vos.",
    },
    {
      type: "flow",
      title: "Lo repetitivo, en automático",
      steps: [
        { icon: "cart", label: "Llega un pedido" },
        { icon: "database", label: "Se registra solo" },
        { icon: "receipt", label: "Se factura" },
        { icon: "mail", label: "El cliente recibe respuesta" },
      ],
      outcome: "Sin cargar nada a mano",
      vo: "Automatizamos lo repetitivo, para que tu equipo se enfoque en hacer crecer el negocio.",
    },
    {
      type: "points",
      title: "Soluciones en 3 áreas",
      items: [
        { icon: "chart-up", text: "Ventas", sub: "Seguimiento de clientes y respuestas más rápidas", tone: "good" },
        { icon: "settings", text: "Administración", sub: "Procesos automáticos, menos errores", tone: "good" },
        { icon: "megaphone", text: "Marketing", sub: "Campañas y comunicación basadas en datos", tone: "good" },
      ],
      vo: "Trabajamos en tres áreas: ventas, administración y marketing.",
    },
    {
      type: "statement",
      text: "Tu empresa crece *con orden*",
      vo: "Para que tu empresa crezca con orden.",
    },
    {
      type: "cta",
      headline: "Agendá una *charla*",
      sub: "Soluciones a medida para tu empresa",
      vo: "Agendá una charla con nosotros. El link está en nuestro perfil.",
    },
  ],
} satisfies Reel;
