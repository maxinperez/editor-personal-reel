import { AbsoluteFill, Img, OffthreadVideo, staticFile, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { Logo } from "../components/Logo.tsx";
import { isVideoFile, LOOKS } from "../lib/look.ts";
import { SANS_TIGHT, SERIF_ITALIC } from "../theme.ts";

/**
 * Portada de un reel (1080x1920). El perfil de Instagram muestra solo el centro en 3:4 (1080x1440,
 * de y=240 a y=1680): todo lo importante va dentro de esa franja.
 *
 * Estilos:
 *  - "foto":        foto a pantalla completa, título centrado abajo.
 *  - "titular":     foto a pantalla completa, título grande alineado a la izquierda arriba (tapa de revista).
 *  - "tipografica": sin foto, fondo de marca; el título es el protagonista.
 */
export type Portada = {
  id: string;
  estilo?: "foto" | "titular" | "tipografica";
  /**
   * Fondo dentro de public/: una imagen, o un video (ej. un clip del B-roll) del que se toma el cuadro del
   * `segundo` indicado. No hace falta en "tipografica".
   */
  fondo?: string;
  /** Si `fondo` es un video: de qué segundo se toma el cuadro (por defecto 0). */
  segundo?: number;
  /** Etiqueta chica arriba (opcional). */
  etiqueta?: string;
  /** Título: una línea por renglón ("\n"); un renglón entre *asteriscos* va grande en serif cursiva. */
  titulo: string;
  /** Color de acento: coral para riesgos/problemas, menta para soluciones. */
  acento?: "coral" | "mint";
  /** Punto de la imagen que queda centrado (CSS object-position). */
  encuadre?: string;
};

export const CROP_3x4 = { top: 240, bottom: 1680 };
const SIDE = 84;

const accentOf = (p: Portada) => (p.acento === "mint" ? COLORS.mint : COLORS.coral);

const lines = (titulo: string) =>
  titulo.split("\n").map((l) => {
    const m = /^\*(.+)\*$/.exec(l.trim());
    return m ? { text: m[1], serif: true } : { text: l.trim(), serif: false };
  });

const Title: React.FC<{ p: Portada; align: "center" | "left"; sans: number; serif: number; serifColor?: string }> = ({
  p,
  align,
  sans,
  serif,
  serifColor,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      textAlign: align,
    }}
  >
    {lines(p.titulo).map((l, i) =>
      l.serif ? (
        <div
          key={i}
          style={{
            fontFamily: SERIF_ITALIC,
            fontSize: Math.min(serif, 1500 / Math.max(2, l.text.length * 0.5)),
            lineHeight: 0.86,
            color: serifColor ?? COLORS.paper,
            letterSpacing: "-0.01em",
            margin: "6px 0 2px",
            marginLeft: align === "left" ? -8 : 0,
          }}
        >
          {l.text}
        </div>
      ) : (
        <div
          key={i}
          style={{
            fontFamily: SANS_TIGHT,
            fontWeight: 700,
            fontSize: sans,
            lineHeight: 1.04,
            letterSpacing: "-0.025em",
          }}
        >
          {l.text}
        </div>
      ),
    )}
  </div>
);

const Tag: React.FC<{ p: Portada; solid?: boolean }> = ({ p, solid = true }) =>
  p.etiqueta ? (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        background: solid ? accentOf(p) : "transparent",
        border: solid ? "none" : `3px solid ${accentOf(p)}`,
        color: solid ? COLORS.night : accentOf(p),
        fontFamily: SANS_TIGHT,
        fontWeight: 700,
        fontSize: 40,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        padding: "14px 30px",
        borderRadius: 16,
        boxShadow: solid ? "0 12px 40px rgba(0,0,0,0.35)" : "none",
      }}
    >
      <Icon name="alert" size={42} strokeWidth={2.6} />
      {p.etiqueta}
    </div>
  ) : null;

/** Foto de fondo (imagen o cuadro de un video) con el look "cine" del B-roll. */
const Photo: React.FC<{ p: Portada; tint: string }> = ({ p, tint }) => {
  const { fps } = useVideoConfig();
  if (!p.fondo) return null;
  const style: React.CSSProperties = {
    position: "absolute",
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: p.encuadre ?? "50% 40%",
    filter: LOOKS.cine.filter,
  };
  return (
    <>
      {isVideoFile(p.fondo) ? (
        <OffthreadVideo src={staticFile(p.fondo)} trimBefore={Math.round((p.segundo ?? 0) * fps)} muted style={style} />
      ) : (
        <Img src={staticFile(p.fondo)} style={style} />
      )}
      <AbsoluteFill style={{ background: tint }} />
    </>
  );
};

/** Foto completa, título centrado abajo. */
const Foto: React.FC<{ p: Portada }> = ({ p }) => (
  <AbsoluteFill style={{ background: COLORS.night }}>
    <Photo p={p} tint="rgba(10,20,40,0.36)" />
    <AbsoluteFill
      style={{
        background: [
          "radial-gradient(ellipse at 50% 35%, rgba(0,0,0,0) 40%, rgba(4,8,18,0.6) 100%)",
          "linear-gradient(to top, rgba(8,14,28,0.96) 12.5%, rgba(8,14,28,0.75) 32%, rgba(8,14,28,0) 58%)",
        ].join(","),
      }}
    />
    <div
      style={{
        position: "absolute",
        top: CROP_3x4.top + 90,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Tag p={p} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 72,
        right: 72,
        bottom: 1920 - CROP_3x4.bottom + 150,
        color: COLORS.paper,
        textShadow: "0 6px 30px rgba(0,0,0,0.45)",
      }}
    >
      <Title p={p} align="center" sans={112} serif={420} />
    </div>
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 1920 - CROP_3x4.bottom + 50,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Logo size={70} />
    </div>
  </AbsoluteFill>
);

/** Titular grande arriba sobre azul de marca; la foto ocupa la mitad de abajo y se funde con el azul. */
const Titular: React.FC<{ p: Portada }> = ({ p }) => (
  <AbsoluteFill style={{ background: COLORS.night }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 920, bottom: 0, overflow: "hidden" }}>
      <Photo p={p} tint="rgba(10,20,40,0.28)" />
      <AbsoluteFill
        style={{
          background: [
            `linear-gradient(to bottom, ${COLORS.night} 0%, rgba(15,27,49,0.6) 22%, rgba(15,27,49,0) 45%)`,
            "linear-gradient(to top, rgba(8,14,28,0.9) 22%, rgba(8,14,28,0) 45%)",
          ].join(","),
        }}
      />
    </div>
    <div style={{ position: "absolute", top: CROP_3x4.top + 80, left: SIDE, right: SIDE, color: COLORS.paper }}>
      <Tag p={p} solid={false} />
      <div style={{ height: 44 }} />
      <Title p={p} align="left" sans={118} serif={330} serifColor={accentOf(p)} />
    </div>
    <div
      style={{
        position: "absolute",
        left: SIDE,
        right: SIDE,
        bottom: 1920 - CROP_3x4.bottom + 70,
        display: "flex",
        alignItems: "center",
        gap: 26,
      }}
    >
      <Logo size={66} />
      <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.55)", borderRadius: 2 }} />
    </div>
  </AbsoluteFill>
);

/** Sin foto: fondo de marca y título protagonista. */
const Tipografica: React.FC<{ p: Portada }> = ({ p }) => {
  const accent = accentOf(p);
  return (
    <AbsoluteFill
      style={{
        background: [
          `radial-gradient(circle at 85% 22%, ${accent}38 0%, rgba(0,0,0,0) 38%)`,
          `radial-gradient(circle at 10% 85%, ${COLORS.mint}22 0%, rgba(0,0,0,0) 40%)`,
          `linear-gradient(160deg, ${COLORS.ink} 0%, ${COLORS.deep} 45%, ${COLORS.night} 100%)`,
        ].join(","),
      }}
    >
      {/* Trama de puntos muy suave para que el fondo no sea plano. */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.09) 2px, transparent 2.5px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black 0%, transparent 75%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: CROP_3x4.top,
          bottom: 1920 - CROP_3x4.bottom,
          left: SIDE,
          right: SIDE,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          color: COLORS.paper,
        }}
      >
        <div>
          <Tag p={p} />
        </div>
        <div style={{ height: 56 }} />
        <Title p={p} align="left" sans={168} serif={400} serifColor={accent} />
        <div style={{ height: 110 }} />
      </div>
      <div
        style={{
          position: "absolute",
          left: SIDE,
          right: SIDE,
          bottom: 1920 - CROP_3x4.bottom + 70,
          display: "flex",
          alignItems: "center",
          gap: 26,
        }}
      >
        <Logo size={66} />
        <div style={{ width: 160, height: 6, borderRadius: 3, background: accent }} />
      </div>
    </AbsoluteFill>
  );
};

export const PortadaView: React.FC<{ portada: Portada }> = ({ portada }) => {
  if (portada.estilo === "titular") return <Titular p={portada} />;
  if (portada.estilo === "tipografica") return <Tipografica p={portada} />;
  return <Foto p={portada} />;
};
