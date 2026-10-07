import { getRemotionEnvironment, getStaticFiles } from "remotion";
import { SANS } from "../theme.ts";

const AUDIO_FILE = /\.(mp3|wav|m4a|aac|ogg)$/i;

/**
 * Solo en Studio: avisa si hay una grabación en public/reels/<id>/ que todavía no se procesó,
 * porque en ese caso el reel se ve con tiempos estimados y sin sonido.
 */
export const AudioHint: React.FC<{ reelId: string; processed: boolean }> = ({ reelId, processed }) => {
  if (processed || !getRemotionEnvironment().isStudio) return null;

  const prefix = `reels/${reelId}/voz`;
  const pending = getStaticFiles().some((f) => f.name.startsWith(prefix) && AUDIO_FILE.test(f.name));
  if (!pending) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 72,
        right: 72,
        padding: "20px 28px",
        borderRadius: 24,
        background: "rgba(255,138,122,0.95)",
        color: "#0F1B31",
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 34,
        lineHeight: 1.25,
        textAlign: "center",
      }}
    >
      Hay una voz sin procesar. En la terminal: npm run voz -- {reelId}
    </div>
  );
};
