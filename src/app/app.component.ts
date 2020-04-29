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

  cursor_boxs = ['leftup', 'rightup', 'leftdown', 'rightdown'];

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

  rgb_color(color: Color) {
    return `rgb(${color.r},${color.g},${color.b})`;
  }

  calc_center_and_radius(startpoint: Point, endpoint: Point) {
    var cx = (startpoint.x + endpoint.x) / 2;
    var cy = (startpoint.y + endpoint.y) / 2;
    var rx = Math.abs(startpoint.x - endpoint.x) / 2;
    var ry = Math.abs(startpoint.y - endpoint.y) / 2;
    return { x: cx, y: cy, rx: rx, ry: ry };
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
                points: []
              };
            } else {
              var points = this.elements[this.elements.length - 1].points;
              var prefix_points = points.slice(0, points.length - 1);

              this.elements[this.elements.length - 1] = {
                kind: this.current_mode,
                ...center_and_radius,
                color: { r: 0, g: 0, b: 0 },
                points: [...prefix_points, end_point]
              };
            }
          }
        }
        break;
      }
      case 'cursor': {
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
      case 'move': {
        if (this.current_mode == 'move') {
          if (this.ifdrag) {
            var circle_info = get_pos_in_svg(event);
            this.elements[this.current_index].x = circle_info.x;
            this.elements[this.current_index].y = circle_info.y;
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
        points: []
      });
    }

    if (this.current_mode == 'path') {
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
        points: [this.svg_pos.start, this.svg_pos.start]
      });
    }
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
