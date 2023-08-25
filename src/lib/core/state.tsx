import { create } from "zustand";
import { Shape } from "konva/lib/Shape";

type CanvasStore = {
  selectedObjects: string[];
  activeTool: "draw" | "select" | "move" | "shape";
  shapes: Shape[];
  selection: ReturnType<Shape["getClientRect"]> | undefined;
  setTool: (t: CanvasStore["activeTool"]) => void;
  addShape: (s: Shape) => void;
  replaceShape: (s: Shape) => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  selectedObjects: [],
  activeTool: "draw",
  selection: undefined,
  setTool: (t) => set({ activeTool: t }),
  shapes: [],
  addShape: (s) => {
    set({ shapes: [...get().shapes, s] });
  },
  replaceShape: (shape) => {
    const shapes = [...get().shapes];
    const index = shapes.findIndex((it) => it.id() === shape.id());
    if (index !== -1) {
      shapes.splice(index, 1, shape);
      set({ shapes });
    }
  },
}));
