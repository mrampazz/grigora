import { FC } from "react";

export enum Objects {
  Line = "Line",
  Rect = "Rect",
  Text = "Text",
}

export type CanvasObject = {
  type: Objects;
  props: any;
};

type ObjectRendererProps = {
  type: Objects;
};

// const ObjectRenderer: FC<ObjectRendererProps> = ({ type }) => {};
