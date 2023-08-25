import { FC, useCallback, useMemo, useRef } from "react";
import { useCanvasStore } from "../state";
import { Line as KonvaLine } from "react-konva";
import { Line } from "konva/lib/shapes/Line";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";

type GrigoraObjectProps = {};

type GrigoraLineProps = GrigoraObjectProps & {
  shape: Shape;
};

export const GrigoraLine: FC<GrigoraLineProps> = ({ shape }) => {
  const selectedObjects = useCanvasStore((s) => s.selectedObjects);
  const lineRef = useRef<Line>(null);

  const isSelected = useMemo(
    () => selectedObjects.includes(shape.id()),
    [shape, selectedObjects]
  );

  const onDragHandler = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      shape.x(e.target.x());
      shape.y(e.target.y());
      useCanvasStore.getState().replaceShape(shape);
    },
    [shape]
  );

  return (
    <KonvaLine
      id={shape.id()}
      ref={lineRef}
      points={(shape as Line).points()}
      stroke="#df4b26"
      strokeWidth={5}
      tension={0.5}
      lineCap="round"
      lineJoin="round"
      draggable={isSelected}
      hitFunc={(ctx, shape) => {
        const stage = shape.getStage();
        if (!stage) return;
        ctx.beginPath();
        ctx.rect(
          shape.getClientRect().x - shape.x() - stage.x(),
          shape.getClientRect().y - shape.y() - stage.y(),
          shape.width(),
          shape.height()
        );
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
      onDragEnd={onDragHandler}
      onDragMove={onDragHandler}
    />
  );
};
