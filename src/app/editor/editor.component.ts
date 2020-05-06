import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { get_pos_in_svg } from '../utils';
import { Point, Element } from '../app.component';

interface Counter {
  group: number;
}
@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements OnInit {
  current_layer_index = -1;
  if_layer_drag: boolean;
  subscription;
  elements;
  current_index: number;
  current_mode: string;
  movingover_index: number;
  ifdrag: boolean;
  lowest_layer = false;
  mouse_position: Point;
  dragged_layer: Element;
  dblclick_index: number;
  shift_selected_indexs: Set<number> = new Set<number>();
  counter: Counter = { group: 0 };

  constructor(private state: StateService) {}

  ngOnInit(): void {
    this.subscription = this.state.getState().subscribe(
      res => {
        this.elements = res.elements;
        this.current_mode = res.mode;
        this.current_index = res.current_index;
        this.if_layer_drag = res.if_layer_drag;
        this.mouse_position = res.mouse_position;
        this.shift_selected_indexs = res.shift_selected_indexs;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  return_toppos(): string {
    return `${this.mouse_position.y}px`;
  }

  return_leftpos(): string {
    return `${this.mouse_position.x}px`;
  }

  layer_dblclick(event, index) {
    this.dblclick_index = index;
    setTimeout(() => {
      document.getElementById('layer-input').focus();
    }, 0);
  }

  layer_mouseup(event, index) {
    this.ifdrag = false;
    if (this.if_layer_drag) {
      if (index == -1) {
        this.state.setStateIfLayerDrag(false);
        var cur_element = this.elements[this.current_layer_index];
        this.elements.splice(this.current_layer_index, 1);
        this.elements.push(cur_element);
        this.current_layer_index = -1;
      } else {
        this.state.setStateIfLayerDrag(false);
        var cur_element = this.elements[this.current_layer_index];
        this.elements.splice(this.current_layer_index, 1);
        if (this.current_layer_index > index) {
          this.elements.splice(index, 0, cur_element);
        } else {
          this.elements.splice(index - 1, 0, cur_element);
        }
        this.current_layer_index = -1;
      }
    }
  }

  layer_mousemove(event, index) {
    if (this.ifdrag) {
      this.state.setStateIfLayerDrag(true);
      this.dragged_layer = this.elements[this.current_layer_index];
    }

    this.ifdrag = false;
    event.preventDefault();
    if (index == -1) {
      this.lowest_layer = true;
      this.movingover_index = -1;
    } else {
      this.lowest_layer = false;
      if (this.if_layer_drag) {
        this.movingover_index = index;
      }
    }
  }

  layer_mousedown(event, index) {
    if (event.shiftKey) {
      this.state.setStateShiftSelectedIndexs(index);
    }

    this.dblclick_index = -1;
    this.ifdrag = true;
    event.preventDefault();
    this.state.setStateCurrentIndex(index);
    this.current_layer_index = index;
  }

  group_click(event) {
    var elements: Element[] = [];
    var indexed_array: Array<number> = Array.from(this.shift_selected_indexs);
    indexed_array.sort(function (a, b) {
      return -a + b;
    });
    for (let index of indexed_array) {
      elements.push(this.elements[index]);
      this.elements.splice(index, 1);
    }
    this.elements.push({
      kind: 'group',
      x: 0,
      y: 0,
      rx: 1,
      ry: 1,
      color: { r: 0, g: 0, b: 0 },
      points: [],
      ratio: [],
      name: 'group' + this.counter.group,
      elements: elements
    });
    this.state.setStateCurrentIndex(this.elements.length - 1);
    this.counter.group += 1;
  }
}
