import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from './state.service';
import { get_pos_in_svg } from './utils';

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
}

interface Color {
  r: number;
  g: number;
  b: number;
}

export interface Point {
  x: number;
  y: number;
}

interface CenterRadius {
  x: number;
  y: number;
  rx: number;
  ry: number;
}

interface Counter {
  ellipse: number;
  square: number;
  path: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'svg-editor';
  color = { r: 0, g: 0, b: 0 };

  elements: Element[];
  ifdrag = false;
  svg_ifdrag = false;
  ifpathdrag = false;
  svg_pos = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };
  current_index = 0;
  cursor_box_size = 8;
  onclick_condition: string;
  clicked_cursor: string;
  counter: Counter = { ellipse: 0, square: 0, path: 0 };
  cursor_boxs = ['leftup', 'rightup', 'leftdown', 'rightdown'];

  keydown(event): void {
    if (event.key == 'Enter') {
      if (this.ifpathdrag) {
        this.ifpathdrag = false;
        this.svg_ifdrag = false;
      }
    }
  }

  calc_cursor_offset_x(cursor_boxs_kind: string, element: Element): number {
    switch (cursor_boxs_kind) {
      case 'leftup':
        return -element.rx - this.cursor_box_size / 2;
      case 'leftdown':
        return -element.rx - this.cursor_box_size / 2;
      case 'rightup':
        return element.rx - this.cursor_box_size / 2;
      case 'rightdown':
        return element.rx - this.cursor_box_size / 2;
    }
  }

  calc_cursor_offset_y(cursor_boxs_kind: string, element: Element): number {
    switch (cursor_boxs_kind) {
      case 'leftup':
        return -element.ry - this.cursor_box_size / 2;
      case 'rightup':
        return -element.ry - this.cursor_box_size / 2;
      case 'leftdown':
        return element.ry - this.cursor_box_size / 2;
      case 'rightdown':
        return element.ry - this.cursor_box_size / 2;
    }
  }

  current_mode: string;
  subscription;

  constructor(private state: StateService) {}

  ngOnInit(): void {
    this.subscription = this.state.getState().subscribe(
      res => {
        this.current_mode = res.mode;
        this.elements = res.elements;
        this.current_index = res.current_index;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngAfterContentInit(): void {
    //source: https://stackoverflow.com/a/50453912/4624070
    document.getElementById('mysvg').scrollIntoView({
      behavior: 'auto',
      block: 'center',
      inline: 'center'
    });
  }

  rgb_color(color: Color): string {
    return `rgb(${color.r},${color.g},${color.b})`;
  }

  calc_center_and_radius(startpoint: Point, endpoint: Point): CenterRadius {
    var cx = (startpoint.x + endpoint.x) / 2;
    var cy = (startpoint.y + endpoint.y) / 2;
    var rx = Math.abs(startpoint.x - endpoint.x) / 2;
    var ry = Math.abs(startpoint.y - endpoint.y) / 2;
    return { x: cx, y: cy, rx: rx, ry: ry };
  }

  mouseup(event) {
    this.state.setStateIfLayerDrag(false);
  }

  mousemove(event) {
    var mouse_position: Point = { x: event.clientX, y: event.clientY };
    this.state.setStateMousePosition(mouse_position);
  }

  svg_mouseup(event) {
    switch (this.onclick_condition) {
      case 'move': {
        this.ifdrag = false;
        break;
      }
      case 'create': {
        if (this.current_mode == 'path') {
          this.ifpathdrag = true;
        } else {
          this.svg_ifdrag = false;
        }

        break;
      }
      case 'cursor': {
        this.onclick_condition = '';
      }
    }
  }

  svg_mousemove(event) {
    switch (this.onclick_condition) {
      case 'create': {
        if (this.svg_ifdrag) {
          if (this.current_mode == 'ellipse' || 'square' || 'path') {
            var end_point = get_pos_in_svg(event);
            var center_and_radius = this.calc_center_and_radius(
              this.svg_pos.start,
              end_point
            );
            if (this.elements[this.elements.length - 1].kind != 'path') {
              this.elements[this.elements.length - 1] = {
                kind: this.current_mode,
                ...center_and_radius,
                color: { r: 0, g: 0, b: 0 },
                points: [],
                ratio: [],
                name: this.elements[this.elements.length - 1].name
              };
            } else {
              var points = this.elements[this.elements.length - 1].points;
              var prefix_points = points.slice(0, points.length - 1);

              this.elements[this.elements.length - 1] = {
                kind: this.current_mode,
                ...center_and_radius,
                color: { r: 0, g: 0, b: 0 },
                points: [...prefix_points, end_point],
                ratio: this.elements[this.elements.length - 1].ratio,
                name: this.elements[this.elements.length - 1].name
              };
            }
          }
        }
        break;
      }
      case 'cursor': {
        if (this.elements[this.current_index].kind == 'path') {
          var element: Element = this.elements[this.current_index];
          var leftup = { x: element.x - element.rx, y: element.y - element.ry };
          var length_x = 2 * element.rx;
          var length_y = 2 * element.ry;

          if (element.ratio.length == 0) {
            for (let point of element.points) {
              var diff_x = point.x - leftup.x;
              var diff_y = point.y - leftup.y;
              this.elements[this.current_index].ratio.push({
                x: diff_x / length_x,
                y: diff_y / length_y
              });
            }
          }
          var current_point: Point = get_pos_in_svg(event);
          var end_point: Point;

          switch (this.clicked_cursor) {
            case 'leftup': {
              end_point = {
                x: element.x + element.rx,
                y: element.y + element.ry
              };
              break;
            }
            case 'rightup': {
              end_point = {
                x: element.x - element.rx,
                y: element.y + element.ry
              };
              break;
            }
            case 'leftdown': {
              end_point = {
                x: element.x + element.rx,
                y: element.y - element.ry
              };
              break;
            }
            case 'rightdown': {
              end_point = {
                x: element.x - element.rx,
                y: element.y - element.ry
              };
              break;
            }
          }
          var center_and_radius = this.calc_center_and_radius(
            current_point,
            end_point
          );

          this.elements[this.current_index].x = center_and_radius.x;
          this.elements[this.current_index].y = center_and_radius.y;
          this.elements[this.current_index].rx = center_and_radius.rx;
          this.elements[this.current_index].ry = center_and_radius.ry;

          var new_length_x = 2 * center_and_radius.rx;
          var new_length_y = 2 * center_and_radius.ry;
          var new_leftup = {
            x: center_and_radius.x - center_and_radius.rx,
            y: center_and_radius.y - center_and_radius.ry
          };

          for (let index in element.ratio) {
            var new_point_x =
              new_leftup.x + element.ratio[parseInt(index)].x * new_length_x;
            var new_point_y =
              new_leftup.y + element.ratio[parseInt(index)].y * new_length_y;

            this.elements[this.current_index].points[parseInt(index)] = {
              x: new_point_x,
              y: new_point_y
            };
          }
        } else {
          var element: Element = this.elements[this.current_index];
          var current_point: Point = get_pos_in_svg(event);
          var end_point: Point;

          switch (this.clicked_cursor) {
            case 'leftup': {
              end_point = {
                x: element.x + element.rx,
                y: element.y + element.ry
              };
              break;
            }
            case 'rightup': {
              end_point = {
                x: element.x - element.rx,
                y: element.y + element.ry
              };
              break;
            }
            case 'leftdown': {
              end_point = {
                x: element.x + element.rx,
                y: element.y - element.ry
              };
              break;
            }
            case 'rightdown': {
              end_point = {
                x: element.x - element.rx,
                y: element.y - element.ry
              };
              break;
            }
          }
          var center_and_radius = this.calc_center_and_radius(
            current_point,
            end_point
          );
          this.elements[this.current_index].x = center_and_radius.x;
          this.elements[this.current_index].y = center_and_radius.y;
          this.elements[this.current_index].rx = center_and_radius.rx;
          this.elements[this.current_index].ry = center_and_radius.ry;
        }
      }
      case 'move': {
        if (this.current_mode == 'move') {
          if (this.ifdrag) {
            var current_pos = get_pos_in_svg(event);
            if (this.elements[this.current_index].kind == 'path') {
              var diff_x = current_pos.x - this.elements[this.current_index].x;
              var diff_y = current_pos.y - this.elements[this.current_index].y;
              this.elements[this.current_index].x = current_pos.x;
              this.elements[this.current_index].y = current_pos.y;
              for (let index in this.elements[this.current_index].points) {
                this.elements[this.current_index].points[
                  parseInt(index)
                ].x += diff_x;
                this.elements[this.current_index].points[
                  parseInt(index)
                ].y += diff_y;
              }
            } else {
              this.elements[this.current_index].x = current_pos.x;
              this.elements[this.current_index].y = current_pos.y;
            }
          }
        }
      }
    }
  }

  svg_mousedown(event) {
    if (this.current_mode == 'ellipse' || this.current_mode == 'square') {
      this.onclick_condition = 'create';
      this.svg_ifdrag = true;
      this.svg_pos.start = get_pos_in_svg(event);
      this.elements.push({
        kind: this.current_mode,
        x: this.svg_pos.start.x,
        y: this.svg_pos.start.y,
        rx: 1,
        ry: 1,
        color: { r: 0, g: 0, b: 0 },
        points: [],
        ratio: [],
        name: this.current_mode + this.counter[this.current_mode]
      });
      this.counter[this.current_mode] += 1;
    }

    if (this.current_mode == 'path') {
      this.onclick_condition = 'create';
      this.svg_ifdrag = true;
      this.svg_pos.start = get_pos_in_svg(event);
      if (!this.ifpathdrag) {
        this.elements.push({
          kind: this.current_mode,
          x: this.svg_pos.start.x,
          y: this.svg_pos.start.y,
          rx: 1,
          ry: 1,
          color: { r: 0, g: 0, b: 0 },
          points: [this.svg_pos.start, this.svg_pos.start],
          ratio: [],
          name: 'path' + this.counter.path
        });
        this.counter.path += 1;
      } else {
        var points = [
          ...this.elements[this.elements.length - 1].points,
          this.svg_pos.start
        ];
        var center_radius = this.get_square_of_path(points);
        this.elements[this.elements.length - 1].points = points;
        this.elements[this.elements.length - 1].x = center_radius.x;
        this.elements[this.elements.length - 1].y = center_radius.y;
        this.elements[this.elements.length - 1].rx = center_radius.rx;
        this.elements[this.elements.length - 1].ry = center_radius.ry;
      }
    }
  }

  get_square_of_path(points: Point[]): CenterRadius {
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

  points_to_path(points: Point[]): string {
    var path: string = '';
    for (let i in points) {
      var index = parseInt(i);
      if (index == 0) {
        path = path + `M${points[index].x} ${points[index].y} `;
      } else {
        path = path + `L${points[index].x} ${points[index].y} `;
      }
    }
    return path;
  }

  element_mousedown(event, index): void {
    this.onclick_condition = 'move';
    if (this.current_mode == 'move') {
      this.ifdrag = true;
      this.state.setStateCurrentIndex(index);
    }
  }

  cursor_mousedown(event, kind: string): void {
    this.onclick_condition = 'cursor';
    this.clicked_cursor = kind;
  }
}
