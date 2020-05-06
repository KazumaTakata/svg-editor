export interface Element {
  kind: string;
  x: number;
  y: number;
  rx: number;
  ry: number;
  color: Color;
  points: Point[];
  ratio: Point[];
  name: string;
  elements: Element[];
}

export interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface CenterRadius {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

export interface Counter {
  ellipse: number;
  square: number;
  path: number;
  group: number;
}
