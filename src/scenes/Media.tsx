import {
  AbsoluteFill,
  getRemotionEnvironment,
  Img,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { COLORS } from "../brand.ts";
import { ContentArea } from "../components/layout.tsx";
import { enter, SPRINGS } from "../lib/anim.ts";
import { SERIF, SANS } from "../theme.ts";
import type { ClipScene, ImageScene } from "../types.ts";

/** Sombras arriba y abajo para que texto y subtítulos se lean sobre cualquier imagen o video. */
const Shade: React.FC = () => (
  <AbsoluteFill
    style={{
      background: [
        "linear-gradient(to top, rgba(10,18,34,0.92) 0%, rgba(10,18,34,0.55) 30%, rgba(10,18,34,0) 55%)",
        "linear-gradient(to bottom, rgba(10,18,34,0.55) 0%, rgba(10,18,34,0) 22%)",
      ].join(","),
    }}
  />
);

const Headline: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, 10, SPRINGS.smooth);
  return (
    <ContentArea style={{ justifyContent: "flex-end", alignItems: "center" }}>
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 600,
          fontSize: 100,
          lineHeight: 1.06,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: COLORS.paper,
          textShadow: "0 4px 30px rgba(0,0,0,0.5)",
          opacity: p,
          transform: `translateY(${(1 - p) * 40}px)`,
        }}
      >
        {text}
      </div>
    </ContentArea>
  );
};

/** Marcador que solo se ve en Studio cuando falta el archivo; en el render final no aparece. */
export const Pending: React.FC<{ kind: string; src: string; hint?: string }> = ({ kind, src, hint }) => {
  if (!getRemotionEnvironment().isStudio) return null;
  return (
    <ContentArea style={{ alignItems: "center" }}>
      <div
        style={{
          border: "3px dashed rgba(255,255,255,0.35)",
          borderRadius: 36,
          padding: "44px 48px",
          fontFamily: SANS,
          color: COLORS.muted,
          textAlign: "center",
          fontSize: 36,
          lineHeight: 1.35,
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 40, color: COLORS.paper, marginBottom: 14 }}>{kind} pendiente</div>
        <div style={{ fontSize: 30, wordBreak: "break-all" }}>public/{src}</div>
        {hint && <div style={{ marginTop: 22, fontStyle: "italic" }}>Prompt: {hint}</div>}
      </div>
    </ContentArea>
  );
};

/** Imagen a pantalla completa con movimiento lento (efecto Ken Burns). */
export const ImageSlide: React.FC<{ scene: ImageScene; exists: boolean }> = ({ scene, exists }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = interpolate(frame, [0, durationInFrames], [0, 1], { extrapolateRight: "clamp" });

  const motion = scene.motion ?? "in";
  const scale = motion === "out" ? 1.2 - 0.14 * t : motion === "in" ? 1.06 + 0.14 * t : 1.16;
  const x = motion === "left" ? -50 * t : motion === "right" ? 50 * t - 25 : 0;

  return (
    <AbsoluteFill>
      {exists ? (
        <>
          <AbsoluteFill style={{ overflow: "hidden" }}>
            <Img
              src={staticFile(scene.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `translateX(${x}px) scale(${scale})`,
              }}
            />
          </AbsoluteFill>
          <Shade />
        </>
      ) : (
        <Pending kind="Imagen" src={scene.src} hint={scene.prompt} />
      )}
      {scene.headline && <Headline text={scene.headline} />}
    </AbsoluteFill>
  );
};

/**
 * Video propio a pantalla completa (b-roll, cámara, screencast).
 * `sceneStart`: cuadro del reel donde empieza la escena (para los clips `sincronizado`).
 */
export const ClipSlide: React.FC<{ scene: ClipScene; exists: boolean; sceneStart: number }> = ({
  scene,
  exists,
  sceneStart,
}) => {
  const { fps } = useVideoConfig();
  const trimBefore = scene.sincronizado ? sceneStart : Math.round((scene.startFromSec ?? 0) * fps);
  return (
    <AbsoluteFill>
      {exists ? (
        <>
          <OffthreadVideo
            src={staticFile(scene.src)}
            trimBefore={trimBefore}
            muted={!scene.withAudio}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Shade />
        </>
      ) : (
        <Pending kind="Video" src={scene.src} />
      )}
      {scene.headline && <Headline text={scene.headline} />}
    </AbsoluteFill>
  );
};
