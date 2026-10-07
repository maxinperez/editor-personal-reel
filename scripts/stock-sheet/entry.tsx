// Hoja de miniaturas para elegir clips de stock (la usa scripts/stock.ts). No es parte de ningún reel.
import { AbsoluteFill, Composition, Img, registerRoot } from "remotion";

export type SheetItem = { image: string; label: string };
type Props = { items: SheetItem[]; cols: number };

const CW = 270;
const CH = 480;
const GAP = 6;

const Sheet: React.FC<Props> = ({ items }) => (
  <AbsoluteFill
    style={{
      background: "#111",
      display: "flex",
      flexWrap: "wrap",
      alignContent: "flex-start",
      gap: GAP,
      padding: GAP,
    }}
  >
    {items.map((it, i) => (
      <div key={i} style={{ position: "relative", width: CW, height: CH, overflow: "hidden" }}>
        <Img src={it.image} style={{ width: CW, height: CH, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            color: "#ff0",
            font: "bold 19px monospace",
            padding: "4px 6px",
          }}
        >
          {it.label}
        </div>
      </div>
    ))}
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition
    id="stock-sheet"
    component={Sheet}
    width={2}
    height={2}
    fps={1}
    durationInFrames={1}
    defaultProps={{ items: [] as SheetItem[], cols: 4 }}
    calculateMetadata={({ props }) => ({
      width: props.cols * (CW + GAP) + GAP,
      height: Math.max(1, Math.ceil(props.items.length / props.cols)) * (CH + GAP) + GAP,
    })}
  />
));
