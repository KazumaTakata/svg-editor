import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Element, Point } from './app.component';

interface State {
  mode: string;
  elements: Element[];
  current_index: number;
  if_layer_drag: boolean;
  mouse_position: Point;
}

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor() {}

  private initState: State = {
    mode: 'move',
    elements: [
      {
        kind: 'ellipse',
        x: 10,
        y: 10,
        rx: 20,
        ry: 20,
        color: { r: 200, g: 0, b: 0 },
        points: [],
        ratio: [],
        name: "ellipse1"
      },
      {
        kind: 'square',
        x: 100,
        y: 100,
        rx: 30,
        ry: 20,
        color: { r: 0, g: 200, b: 0 },
        points: [],
        ratio: [],
        name: "square1"
      }
    ],
    current_index: 0,
    if_layer_drag: false,
    mouse_position: { x: 0, y: 0 }
  };
  private stateTracker = new BehaviorSubject<State>(this.initState);

  getState(): Observable<State> {
    return this.stateTracker.asObservable();
  }

  setState(newState: State): void {
    this.stateTracker.next(newState);
  }

  setStateElements(elements: Element[]): void {
    var current_state = this.stateTracker.getValue();
    this.stateTracker.next({
      mode: current_state.mode,
      elements: elements,
      current_index: current_state.current_index,
      if_layer_drag: current_state.if_layer_drag,
      mouse_position: current_state.mouse_position
    });
  }

  setStateMode(mode: string): void {
    var current_state = this.stateTracker.getValue();
    this.stateTracker.next({
      mode: mode,
      elements: current_state.elements,
      current_index: current_state.current_index,
      if_layer_drag: current_state.if_layer_drag,
      mouse_position: current_state.mouse_position
    });
  }

  setStateCurrentIndex(current_index: number): void {
    var current_state = this.stateTracker.getValue();
    this.stateTracker.next({
      mode: current_state.mode,
      elements: current_state.elements,
      current_index: current_index,
      if_layer_drag: current_state.if_layer_drag,
      mouse_position: current_state.mouse_position
    });
  }

  setStateIfLayerDrag(if_layer_drag: boolean): void {
    var current_state = this.stateTracker.getValue();
    this.stateTracker.next({
      mode: current_state.mode,
      elements: current_state.elements,
      current_index: current_state.current_index,
      if_layer_drag: if_layer_drag,
      mouse_position: current_state.mouse_position
    });
  }

  setStateMousePosition(mouse_position: Point): void {
    var current_state = this.stateTracker.getValue();
    this.stateTracker.next({
      mode: current_state.mode,
      elements: current_state.elements,
      current_index: current_state.current_index,
      if_layer_drag: current_state.if_layer_drag,
      mouse_position: mouse_position
    });
  }

  resetState(): void {
    this.stateTracker.next(this.initState);
  }
}
