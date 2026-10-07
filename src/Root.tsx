import { Composition, Folder } from "remotion";
import { ReelComposition } from "./components/ReelComposition.tsx";
import { portadas } from "./covers/index.ts";
import { PortadaView } from "./covers/Portada.tsx";
import { estimateTiming } from "./lib/timing.ts";
import { reels } from "./reels/index.ts";
import { calculateReelMetadata } from "./reelMetadata.ts";
import { FPS, H, W } from "./theme.ts";
import type { ReelProps } from "./types.ts";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Folder name="Reels">
        {reels.map((reel) => {
          const defaultProps: ReelProps = { reel, timing: estimateTiming(reel), assets: {} };
          return (
            <Composition
              key={reel.id}
              id={reel.id}
              component={ReelComposition}
              width={W}
              height={H}
              fps={FPS}
              durationInFrames={Math.ceil((defaultProps.timing.durationMs / 1000) * FPS)}
              defaultProps={defaultProps}
              calculateMetadata={calculateReelMetadata}
            />
          );
        })}
      </Folder>
      {/* Portadas: imágenes fijas de un solo cuadro (a 30 fps, para poder tomar el cuadro exacto de un video). */}
      <Folder name="Portadas">
        {portadas.map((p) => (
          <Composition
            key={p.id}
            id={`portada-${p.id}`}
            component={PortadaView}
            width={W}
            height={H}
            fps={FPS}
            durationInFrames={1}
            defaultProps={{ portada: p }}
          />
        ))}
      </Folder>
    </>
  );
};
