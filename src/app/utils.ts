import { Point, CenterRadius } from './model';

export function get_pos_in_svg(event): Point {
  var svg = <any>document.getElementById('mysvg');
  var pt = svg.createSVGPoint(),
    svgP,
    circle;
  pt.x = event.clientX;
  pt.y = event.clientY;
  svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: svgP.x, y: svgP.y };
}

export function get_square_of_path(points: Point[]): CenterRadius {
  var max_x = -Infinity;
  var min_x = Infinity;
  var max_y = -Infinity;
  var min_y = Infinity;

  for (let point of points) {
    if (point.x > max_x) {
      max_x = point.x;
    }
    if (point.x < min_x) {
      min_x = point.x;
    }
    if (point.y > max_y) {
      max_y = point.y;
    }
    if (point.y < min_y) {
      min_y = point.y;
    }
  }

  var x = (max_x + min_x) / 2;
  var y = (max_y + min_y) / 2;
  var rx = (max_x - min_x) / 2;
  var ry = (max_y - min_y) / 2;

  return { x: x, y: y, rx: rx, ry: ry };
}
