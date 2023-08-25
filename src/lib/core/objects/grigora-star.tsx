import { FC, useCallback, useMemo } from "react";
import { useCanvasStore } from "../state";
import { Star as KonvaStar } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape } from "konva/lib/Shape";
import { Star } from "konva/lib/shapes/Star";

type GrigoraObjectProps = {};

type GrigoraStarProps = GrigoraObjectProps & {
  shape: Shape;
};

export const GrigoraStar: FC<GrigoraStarProps> = ({ shape }) => {
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
    <KonvaStar
      numPoints={(shape as Star).numPoints()}
      innerRadius={(shape as Star).innerRadius()}
      outerRadius={(shape as Star).outerRadius()}
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
