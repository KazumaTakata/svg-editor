import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { Element, Point, Color, CenterRadius } from '../model';
import { get_pos_in_svg, get_square_of_path } from '../utils';
import { StateService } from '../state.service';

@Component({
  selector: '[app-element]',
  templateUrl: './element.component.html',
  styleUrls: ['./element.component.css']
})
export class ElementComponent implements OnInit {
  @Input() element: Element;
  @Input() index: number;
  @Output() MouseDownEvent = new EventEmitter<any>();
  @Output() MouseUpEvent = new EventEmitter<any>();
  @Output() MouseMoveEvent = new EventEmitter<any>();
  @Output() CursorMouseDownEvent = new EventEmitter<any>();

  constructor(private state: StateService) {}

  subscription;

  lements: Element[];
  ifdrag = false;
  current_index = 0;
  cursor_box_size = 8;
  onclick_condition: string;
  clicked_cursor: string;
  cursor_boxs = ['leftup', 'rightup', 'leftdown', 'rightdown'];

  get_square_of_path(points: Point[]) {
    get_square_of_path(points);
  }

  element_mousedown(event, index): void {
    this.MouseDownEvent.emit(event);
  }

  ngOnInit(): void {
    this.subscription = this.state.getState().subscribe(
      res => {
        this.current_index = res.current_index;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  rgb_color(color: Color): string {
    return `rgb(${color.r},${color.g},${color.b})`;
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

  cursor_mousedown(kind: string): void {
    this.CursorMouseDownEvent.emit(kind)
  }


  svg_mouseup(event) {
    this.MouseUpEvent.emit(event);
  }

  svg_mousemove(event) {
    this.MouseMoveEvent.emit(event);
  }
}
