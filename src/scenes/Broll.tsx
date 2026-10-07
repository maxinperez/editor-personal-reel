import { AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS } from "../brand.ts";
import { Icon } from "../components/Icon.tsx";
import { enter, SPRINGS } from "../lib/anim.ts";
import { LOOKS, type LookName } from "../lib/look.ts";
import { SANS_TIGHT } from "../theme.ts";
import type { BrollClip, BrollScene } from "../types.ts";
import { Pending } from "./Media.tsx";

const ClipView: React.FC<{
  clip: BrollClip;
  index: number;
  exists: boolean;
  grade: LookName;
}> = ({ clip, index, exists, grade }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  if (!exists) return <Pending kind="Video" src={clip.src} />;

  // Movimiento lento (acerca / aleja) para que ningún plano quede estático.
  const t = frame / Math.max(1, durationInFrames - 1);
  const zoom = clip.zoom ?? (index % 2 === 0 ? "in" : "out");
  const scale = zoom === "none" ? 1 : zoom === "in" ? 1.02 + 0.08 * t : 1.1 - 0.08 * t;
  const g = LOOKS[grade];

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(clip.src)}
        trimBefore={Math.round((clip.startFromSec ?? 0) * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale})`,
          filter: g.filter,
        }}
      />
      <AbsoluteFill style={{ background: g.tint }} />
      <AbsoluteFill
        style={{
          background: [
            "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(4,8,18,0.55) 100%)",
            "linear-gradient(to top, rgba(8,14,28,0.45) 0%, rgba(8,14,28,0) 40%)",
          ].join(","),
        }}
      />
    </AbsoluteFill>
  );
};

const Tag: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = enter(frame, fps, 6, SPRINGS.pop);
  return (
    <div
      style={{
        position: "absolute",
        top: 290,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        transform: `scale(${p})`,
        opacity: Math.min(1, p * 2),
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: COLORS.coral,
          color: COLORS.night,
          fontFamily: SANS_TIGHT,
          fontWeight: 700,
          fontSize: 42,
          letterSpacing: "0.02em",
          textTransform: "uppercase",
          padding: "16px 34px",
          borderRadius: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        }}
      >
        <Icon name="alert" size={44} strokeWidth={2.6} />
        {text}
      </div>
    </div>
  );
};

/** Varios clips en cortes secos, repartidos a lo largo de la escena. */
export const Broll: React.FC<{ scene: BrollScene; assets: Record<string, boolean> }> = ({ scene, assets }) => {
  const { durationInFrames } = useVideoConfig();
  const grade = scene.grade ?? "cine";

  const weights = scene.clips.map((c) => c.weight ?? 1);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  const bounds = weights.map((w) => {
    const from = Math.round((acc / total) * durationInFrames);
    acc += w;
    return { from, to: Math.round((acc / total) * durationInFrames) };
  });

  return (
    <AbsoluteFill>
      {scene.clips.map((clip, i) => (
        <Sequence
          key={i}
          from={bounds[i].from}
          durationInFrames={Math.max(1, bounds[i].to - bounds[i].from)}
          premountFor={30}
        >
          <ClipView clip={clip} index={i} exists={assets[clip.src] === true} grade={grade} />
        </Sequence>
      ))}
      {scene.tag && <Tag text={scene.tag} />}
    </AbsoluteFill>
  );
};
