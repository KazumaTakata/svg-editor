import { Component, OnInit } from '@angular/core';
import { StateService } from '../state.service';
import { get_pos_in_svg } from '../utils';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  current_layer_index = -1;
  if_layer_drag: boolean;
  subscription;
  elements;
  current_index: number;
  current_mode: string;
  movingover_index: number;
  lowest_layer = false;

  constructor(private state: StateService) {}

  ngOnInit(): void {
    this.subscription = this.state.getState().subscribe(
      res => {
        this.elements = res.elements;
        this.current_mode = res.mode;
        this.current_index = res.current_index;
        this.if_layer_drag = res.if_layer_drag;
      },
      err => {
        console.error(`An error occurred: ${err.message}`);
      }
    );
  }

  layer_mouseup(event, index) {
    if (index == -1) {
      this.state.setStateIfLayerDrag(false);
      var cur_element = this.elements[this.current_layer_index];
      this.elements.splice(this.current_layer_index, 1);
      this.elements.push(cur_element)
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

  layer_mousemove(event, index) {
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

    //if (this.if_layer_drag && this.current_layer_index == index) {
    //var circle_info = get_pos_in_svg(event)
    //this.elements[index].x = circle_info.x
    //this.elements[index].y = circle_info.y
    //}
  }

  layer_mousedown(event, index) {
    event.preventDefault();
    this.state.setStateIfLayerDrag(true);
    this.current_layer_index = index;
  }
}
