import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Observable } from 'rxjs';
import { Element } from './app.component'



interface State {
    mode: string;
    elements: Element[];
    current_index: number;
}


@Injectable({
  providedIn: 'root'
})
export class StateService {

  constructor() { }

  private initState: State = {mode: "move", elements: [ {kind: "ellipse", x:10, y:10, rx:20, ry:20, color:{ r:200, g:0, b:0} }, {kind: "square", x:100, y:100, rx:30, ry:20, color:{ r:0, g:200, b:0} }], current_index:0 }
  private stateTracker = new BehaviorSubject<State>(this.initState);


  getState(): Observable<State> {
    return this.stateTracker.asObservable();
  }

  setState(newState: State): void {
    this.stateTracker.next(newState);
  }

  setStateElements(elements: Element[]): void {
    var current_state = this.stateTracker.getValue()
    this.stateTracker.next({mode: current_state.mode, elements: elements, current_index: current_state.current_index}) 
  }

  setStateMode(mode: string): void {
    var current_state = this.stateTracker.getValue()
    this.stateTracker.next({mode: mode, elements: current_state.elements, current_index: current_state.current_index}) 
  }

  setStateCurrentIndex(current_index: number): void {
    var current_state = this.stateTracker.getValue()
    this.stateTracker.next({mode: current_state.mode, elements: current_state.elements, current_index: current_index}) 
  }


  resetState(): void {
    this.stateTracker.next(this.initState);
  }


}
