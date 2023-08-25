import { FC, useCallback, useMemo } from "react";
import { useCanvasStore } from "../state";
import { Rect as KonvaRect } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";

type GrigoraObjectProps = {};

type GrigoraRectProps = GrigoraObjectProps & {
  shape: Shape;
};

export const GrigoraRect: FC<GrigoraRectProps> = ({ shape }) => {
  const selectedObjects = useCanvasStore((s) => s.selectedObjects);

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
    <KonvaRect
      id={shape.id()}
      x={shape.x()}
      y={shape.y()}
      width={shape.width()}
      height={shape.height()}
      fill="#df4b26"
      draggable={isSelected}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.rect(
          shape.getClientRect().x - shape.x(),
          shape.getClientRect().y - shape.y(),
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
