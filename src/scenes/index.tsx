import type { Scene } from "../types.ts";
import { Compare } from "./Compare.tsx";
import { Cta } from "./Cta.tsx";
import { Flow } from "./Flow.tsx";
import { Hook } from "./Hook.tsx";
import { Broll } from "./Broll.tsx";
import { ClipSlide, ImageSlide } from "./Media.tsx";
import { Points } from "./Points.tsx";
import { Sheet } from "./Sheet.tsx";
import { Stat } from "./Stat.tsx";
import { Statement } from "./Statement.tsx";

/** Escenas a pantalla completa: no se desplazan con la transición. */
export const isFullBleed = (scene: Scene): boolean =>
  scene.type === "image" || scene.type === "clip" || scene.type === "broll";

/** `from`: cuadro del reel en el que empieza la escena. */
export const SceneView: React.FC<{ scene: Scene; assets: Record<string, boolean>; from: number }> = ({
  scene,
  assets,
  from,
}) => {
  switch (scene.type) {
    case "hook":
      return <Hook scene={scene} />;
    case "statement":
      return <Statement scene={scene} />;
    case "points":
      return <Points scene={scene} />;
    case "compare":
      return <Compare scene={scene} />;
    case "flow":
      return <Flow scene={scene} />;
    case "stat":
      return <Stat scene={scene} />;
    case "image":
      return <ImageSlide scene={scene} exists={assets[scene.src] === true} />;
    case "clip":
      return <ClipSlide scene={scene} exists={assets[scene.src] === true} sceneStart={from} />;
    case "broll":
      return <Broll scene={scene} assets={assets} />;
    case "sheet":
      return <Sheet scene={scene} />;
    case "cta":
      return <Cta scene={scene} />;
  }
};
