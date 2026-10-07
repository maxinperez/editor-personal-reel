import { AbsoluteFill, Html5Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SceneFrame, OVERLAP } from "./SceneFrame.tsx";
import { Background } from "./Background.tsx";
import { AudioHint } from "./AudioHint.tsx";
import { Captions, toPages } from "./Captions.tsx";
import { EditorialCaptions, toBlocks } from "./EditorialCaptions.tsx";
import { isFullBleed, SceneView } from "../scenes/index.tsx";
import type { ReelProps } from "../types.ts";

const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

export const ReelComposition: React.FC<ReelProps> = ({ reel, timing, assets }) => {
  const { fps, durationInFrames } = useVideoConfig();

  const frames = reel.scenes.map((scene, i) => {
    const from = msToFrame(timing.scenes[i].startMs, fps);
    const to = i === reel.scenes.length - 1 ? durationInFrames : msToFrame(timing.scenes[i].endMs, fps);
    return { scene, from, to };
  });

  const hidden: [number, number][] = frames.filter((f) => f.scene.hideCaptions).map((f) => [f.from, f.to]);

  const music = reel.music;

  return (
    <AbsoluteFill>
      <Background />

      {frames.map(({ scene, from, to }, i) => {
        const hasNext = i < frames.length - 1;
        const duration = to - from + (hasNext ? OVERLAP : 0);
        return (
          <Sequence key={i} from={from} durationInFrames={Math.max(1, duration)} premountFor={fps}>
            <SceneFrame durationInFrames={Math.max(1, duration)} hasNext={hasNext} fullBleed={isFullBleed(scene)}>
              <SceneView scene={scene} assets={assets} from={from} />
            </SceneFrame>
          </Sequence>
        );
      })}

      {reel.captions !== false &&
        (reel.captionStyle === "editorial" ? (
          <EditorialCaptions
            blocks={toBlocks(timing.words)}
            hidden={hidden}
            positions={frames.map((f) => ({ from: f.from, to: f.to, y: f.scene.captionY ?? 54 }))}
          />
        ) : (
          <Captions pages={toPages(timing.words)} hidden={hidden} />
        ))}

      {timing.audioFile && assets[timing.audioFile] && <Html5Audio src={staticFile(timing.audioFile)} />}
      <AudioHint reelId={reel.id} processed={timing.source === "audio"} />
      {music && assets[music.src] && <Html5Audio src={staticFile(music.src)} volume={music.volume ?? 0.1} loop />}
    </AbsoluteFill>
  );
};
