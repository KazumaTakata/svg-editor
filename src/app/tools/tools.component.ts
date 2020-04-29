import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from '../state.service'

@Component({
    selector: 'app-tools',
    templateUrl: './tools.component.html',
    styleUrls: ['./tools.component.css']
})
export class ToolsComponent implements OnInit, OnDestroy {

    modes = [ {mode:"move", font:"arrows-alt"}, {mode:"ellipse", font:"circle"}, {mode:"square", font:"square"}, {mode:"path", font:"pen" }]
    current_mode = "move"
    subscription;



    constructor(private state: StateService) { }

    ngOnInit(): void {
        this.subscription = this.state.getState().subscribe(
            res => {
                this.current_mode = res.mode;
            },
            err => {
                console.error(`An error occurred: ${err.message}`);
            }
        );
    }


    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    mode_click(event, mode) {
        this.state.setStateMode(mode)
    }

}
