import { FC, Fragment, RefObject, useEffect, useMemo, useRef } from "react";
import { Layer, Line, Rect, Stage } from "react-konva";
import { useTool } from "./tools";
import { useCanvasStore } from "./state";
import { GrigoraLine } from "./objects/grigora-line";
import { Transformer as KonvaTransformer } from "react-konva";
import { Transformer } from "konva/lib/shapes/Transformer";
import { Layer as KonvaLayer } from "konva/lib/Layer";
import { GrigoraRect } from "./objects/grigora-rect";

type CanvasProps = {
  width: number;
  height: number;
};

type ObjectsRendererProps = {};

export const ObjectsRenderer: FC<ObjectsRendererProps> = () => {
  const shapes = useCanvasStore((s) => s.shapes);
  const selectedObjects = useCanvasStore((s) => s.selectedObjects);
  const trRef = useRef<Transformer>(null);

  useEffect(() => {
    if (!trRef.current) return;
    trRef.current.padding(10);
    const nodes = shapes.filter((it) => selectedObjects.includes(it.id()));
    if (nodes) {
      trRef.current.nodes(nodes);
    }
  }, [selectedObjects, shapes]);

  return (
    <>
      {shapes.map((shape, i) => {
        switch (shape.attrs.type) {
          case "line":
            return <GrigoraLine key={i} shape={shape} />;
          case "rect":
            return <GrigoraRect key={i} shape={shape} />;
          default:
            return <></>;
        }
      })}
      <KonvaTransformer
        ref={trRef}
        boundBoxFunc={(oldBox, newBox) => {
          // limit resize
          if (newBox.width < 5 || newBox.height < 5) {
            return oldBox;
          }
          return newBox;
        }}
      />
    </>
  );
};

export const SelectionLayer: FC = () => {
  const selection = useCanvasStore((s) => s.selection);
  return (
    <Layer>
      {selection && (
        <Rect
          x={selection.x}
          y={selection.y}
          width={selection.width}
          height={selection.height}
          fill="#ffffff20"
          strokeWidth={1}
          stroke="#ffffff80"
          draggable={false}
          cornerRadius={2}
        />
      )}
    </Layer>
  );
};

export const Canvas: FC<CanvasProps> = ({ width, height }) => {
  const tool = useCanvasStore((s) => s.activeTool);
  const ctx = useTool(tool);
  const layerRef = useRef<KonvaLayer>(null);

  useEffect(() => {
    layerRef.current?.toggleHitCanvas();
  }, []);

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={ctx?.onMouseDown}
      onMouseUp={ctx?.onMouseUp}
      onMouseMove={ctx?.onMouseMove}
      draggable={tool === "move"}
    >
      <Layer ref={layerRef}>
        <ObjectsRenderer />
      </Layer>
      <SelectionLayer />
    </Stage>
  );
};
