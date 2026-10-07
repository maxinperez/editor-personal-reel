import { Img, staticFile } from "remotion";
import { BRAND, COLORS } from "../brand.ts";
import { SERIF } from "../theme.ts";

/**
 * Logo de la marca. Con BRAND.logo usa el archivo original (fondo blanco) recortado sobre una tarjeta
 * blanca, sin alterar sus colores. Sin logo, dibuja el isotipo "A&C" en texto.
 * `size` es el alto de la tarjeta.
 */
export const Logo: React.FC<{ size?: number }> = ({ size = 160 }) => {
  if (BRAND.logo) {
    const c = BRAND.logoCrop;
    const width = size * (c.w / c.h);
    return (
      <div
        style={{
          width,
          height: size,
          borderRadius: size * 0.14,
          background: "#FFFFFF",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
        }}
      >
        <Img
          src={staticFile(BRAND.logo)}
          style={{
            position: "absolute",
            width: `${(c.size / c.w) * 100}%`,
            left: `${-(c.x / c.w) * 100}%`,
            top: `${-(c.y / c.h) * 100}%`,
          }}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.26,
        background: `linear-gradient(145deg, ${COLORS.mint}, ${COLORS.green})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 18px 50px rgba(17,96,79,0.45)",
        fontFamily: SERIF,
        fontWeight: 700,
        fontSize: size * 0.36,
        color: COLORS.night,
        letterSpacing: "-0.03em",
      }}
    >
      {BRAND.name}
    </div>
  );
};
