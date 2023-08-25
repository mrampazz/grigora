import { KonvaEventObject } from "konva/lib/Node";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCanvasStore } from "./state";
import { Line } from "konva/lib/shapes/Line";
import { Rect } from "konva/lib/shapes/Rect";
import Konva from "konva";
import { Shape } from "konva/lib/Shape";

export type Tool = {
  id: string;
  // mouse events to attach
  onMouseDown: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseUp: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseMove: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseEnter: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseLeave: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOut: (e: KonvaEventObject<MouseEvent>) => void;
  onMouseOver: (e: KonvaEventObject<MouseEvent>) => void;
};

export type LineData = {
  type: "line";
  id: string;
  points: number[];
};

export const useTool = (toolId: string) => {
  const ctx = useMemo(() => {
    switch (toolId) {
      case "draw":
        return DrawingContext();
      case "select":
        return SelectionContext();
      case "move":
        return PanningContext();
      case "shape":
        return ShapeContext();
    }
  }, [toolId]);
  return ctx;
};

export const ShapeContext = (): Tool => {
  let isDrawing = false;
  let rect: Rect | undefined;
  const start: { x: number; y: number } = { x: 0, y: 0 };
  let area: { x1: number; y1: number; x2: number; y2: number } | undefined;

  return {
    id: "draw",
    onMouseDown: (e) => {
      const stage = e.target.getStage();
      if (!stage) return;
      isDrawing = true;
      const pos = stage.getRelativePointerPosition();

      if (!pos) return;
      start.x = pos.x;
      start.y = pos.y;
      rect = new Rect({ id: uuidv4(), x: pos.x, y: pos.y, type: "rect" });
      // add line
      useCanvasStore.getState().addShape(rect);
    },
    onMouseUp: (e) => {
      isDrawing = false;
    },
    onMouseMove: (e) => {
      if (!isDrawing || !rect) return;
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      area = {
        x1: start.x,
        y1: start.y,
        x2: pos.x,
        y2: pos.y,
      };
      rect.x(Math.min(area.x1, area.x2));
      rect.y(Math.min(area.y1, area.y2));
      rect.width(Math.abs(area.x2 - area.x1));
      rect.height(Math.abs(area.y2 - area.y1));
      useCanvasStore.getState().replaceShape(rect);
    },
    onMouseEnter: (e) => {},
    onMouseLeave: (e) => {},
    onMouseOut: (e) => {},
    onMouseOver: (e) => {},
  };
};

// when the pen tool is activated call this function
export const DrawingContext = (): Tool => {
  let isDrawing = false;
  let line: Line | undefined;
  return {
    id: "draw",
    onMouseDown: (e) => {
      const stage = e.target.getStage();
      if (!stage) return;
      isDrawing = true;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      line = new Line({ id: uuidv4(), points: [pos.x, pos.y], type: "line" });
      // add line
      useCanvasStore.getState().addShape(line);
    },
    onMouseUp: (e) => {
      isDrawing = false;
    },
    onMouseMove: (e) => {
      if (!isDrawing || !line) return;
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      line.points([...line.points(), pos.x, pos.y]);
      useCanvasStore.getState().replaceShape(line);
    },
    onMouseEnter: (e) => {},
    onMouseLeave: (e) => {},
    onMouseOut: (e) => {},
    onMouseOver: (e) => {},
  };
};

export const SelectionContext = (): Tool => {
  let isSelecting = false;
  const start: { x: number; y: number } = { x: 0, y: 0 };
  let area: ReturnType<Shape["getClientRect"]> | undefined;
  return {
    id: "select",
    onMouseDown: (e) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const clickedOnEmpty = e.target === stage;
      if (clickedOnEmpty) {
        useCanvasStore.setState({ selectedObjects: [] });
      }

      // if we have the mod key pressed we can select multiple shapes
      const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;

      // handle when clicking on the shapes
      const { selectedObjects } = useCanvasStore.getState();
      const isSelected = selectedObjects.includes(e.target.id());
      if (!isSelected && !metaPressed) {
        useCanvasStore.setState({
          selectedObjects: [e.target.id()],
        });
      } else if (!isSelected && metaPressed) {
        useCanvasStore.setState({
          selectedObjects: [...selectedObjects, e.target.id()],
        });
      } else if (isSelected && metaPressed) {
        useCanvasStore.setState({
          selectedObjects: selectedObjects.filter((it) => it !== e.target.id()),
        });
      }

      useCanvasStore.setState({ selection: undefined });
      isSelecting = true;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      if (area) area = undefined;
      start.x = pos.x;
      start.y = pos.y;
    },
    onMouseUp: (e) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      area = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      };

      // check intersection
      const shapes = useCanvasStore.getState().shapes;
      const selectedIds: string[] = [];
      shapes.forEach((shape) => {
        const elBox = shape.getClientRect();
        if (area && Konva.Util.haveIntersection(area, elBox)) {
          selectedIds.push(shape.id());
        }
      });
      useCanvasStore.setState({
        selection: undefined,
        selectedObjects: selectedIds,
      });

      isSelecting = false;
    },
    onMouseMove: (e) => {
      if (!isSelecting) return;
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getRelativePointerPosition();
      if (!pos) return;
      area = {
        x: Math.min(start.x, pos.x),
        y: Math.min(start.y, pos.y),
        width: Math.abs(pos.x - start.x),
        height: Math.abs(pos.y - start.y),
      };

      useCanvasStore.setState({ selection: area });
    },
    onMouseEnter: (e) => {},
    onMouseLeave: (e) => {},
    onMouseOut: (e) => {},
    onMouseOver: (e) => {},
  };
};

export const PanningContext = (): Tool => {
  return {
    id: "move",
    onMouseDown: (e) => {
      //   const stage = e.target.getStage();
      //   if (!stage) return;
      //   const pos = stage.getRelativePointerPosition();
      //   if (!pos) return;
      //   // add line
      //   useCanvasStore
      //     .getState()
      //     .addLine({ id: uuidv4(), points: [pos.x, pos.y] });
    },
    onMouseUp: (e) => {},
    onMouseMove: (e) => {
      //   const stage = e.target.getStage();
      //   if (!stage) return;
      //   const pos = stage.getRelativePointerPosition();
      //   if (!pos) return;
      //   useCanvasStore.getState().updateLine([pos.x, pos.y]);
    },
    onMouseEnter: (e) => {},
    onMouseLeave: (e) => {},
    onMouseOut: (e) => {},
    onMouseOver: (e) => {},
  };
};
