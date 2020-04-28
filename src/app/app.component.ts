import { Component, OnInit, OnDestroy } from '@angular/core';
import { StateService } from './state.service'
import { get_pos_in_svg } from './utils'


export interface Element {
    kind: string;
    x: number;
    y: number;
    rx: number;
    ry: number;
    color: Color;
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
export class AppComponent implements OnInit, OnDestroy  {
    title = 'svg-editor';
    color = {r:0, g:0, b:0}

    elements: Element[] 
    ifdrag = false
    svg_ifdrag = false
    svg_pos = {start: {x:0, y:0}, end: {x:0, y:0}}
    current_index= 0
    cursor_box_size = 8

    cursor_boxs = ["leftup", "rightup", "leftdown", "rightdown"]

    calc_cursor_offset_x(cursor_boxs_kind:string, element:Element):number {
        switch (cursor_boxs_kind) {
            case "leftup":
                return - element.rx - this.cursor_box_size/2
            case "leftdown":
                return - element.rx - this.cursor_box_size/2
            case "rightup":
                return    element.rx - this.cursor_box_size/2
            case "rightdown":
                return   element.rx - this.cursor_box_size/2

        }
    }

    calc_cursor_offset_y(cursor_boxs_kind:string, element:Element):number {
        switch (cursor_boxs_kind) {
            case "leftup":
                return - element.ry - this.cursor_box_size/2
            case "rightup":
                return - element.ry - this.cursor_box_size/2
            case "leftdown":
                return  element.ry - this.cursor_box_size/2
            case "rightdown":
                return  element.ry - this.cursor_box_size/2
        }
    }



    current_mode:string;
    subscription;

    constructor(private state: StateService) {
    }


    ngOnInit(): void {
        this.subscription = this.state.getState().subscribe(
            res => {
                this.current_mode = res.mode;
                this.elements = res.elements;
                this.current_index = res.current_index
            },
            err => {
                console.error(`An error occurred: ${err.message}`);
            }
        );
    }
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }


    svg_mouseup(event) {
        if (this.current_mode == "ellipse" ||  this.current_mode == "square" ) {

            this.svg_ifdrag = false
        }
    }

    rgb_color(color) {
        return `rgb(${color.r},${color.g},${color.b})`
    }

    calc_center_and_radius (startpoint:Point, endpoint:Point) {
        var cx = (startpoint.x + endpoint.x)/2
        var cy = (startpoint.y + endpoint.y)/2
        var rx = Math.abs(startpoint.x - endpoint.x)/2
        var ry = Math.abs(startpoint.y - endpoint.y)/2
        return {x:cx, y:cy, rx:rx, ry:ry}
    }

    svg_mousemove(event) {
        if (this.svg_ifdrag) {
            if (this.current_mode == "ellipse" || "square" ) {
                var endpoint = get_pos_in_svg(event)
                var center_and_radius = this.calc_center_and_radius(this.svg_pos.start, endpoint) 
                this.elements[this.elements.length - 1] =  { kind: this.current_mode, ...center_and_radius  , color:{r:0, g:0, b:0}}
            }
        }
    }

    svg_mousedown(event) {
        if (this.current_mode == "ellipse" || this.current_mode == "square") {
            this.svg_ifdrag = true
            this.svg_pos.start = get_pos_in_svg(event) 
            this.elements.push( { kind: this.current_mode , x:this.svg_pos.start.x, y: this.svg_pos.start.y, rx:1, ry:1, color:{r:0, g:0, b:0}})

        }
    }


    mouseup(event, index) {
        if (this.current_mode == "move") {
            this.ifdrag = false
        }
    }

    mousemove(event, index) {
        if (this.current_mode == "move") {

            if (this.ifdrag && this.current_index == index) {
                var circle_info = get_pos_in_svg(event)
                this.elements[index].x = circle_info.x
                this.elements[index].y = circle_info.y


            }
        }
    }

    mousedown(event, index) {
        if (this.current_mode == "move") {
            this.ifdrag = true
            this.state.setStateCurrentIndex(index)
        }
    }


    cursor_mouseup(event, kind:string) {
    }


    cursor_mousedown(event, kind:string):void{
        switch (kind) {
            case "leftup":
                var element:Element = this.elements[this.current_index]
            var current_pos:Point = get_pos_in_svg(event)
            var rightdown:Point = { x:element.x + element.rx, y: element.y + element.ry }
            var center_and_radius = this.calc_center_and_radius(current_pos, rightdown)
            this.elements[this.elements.length - 1].x =  center_and_radius.x
            this.elements[this.elements.length - 1].y =  center_and_radius.y
            this.elements[this.elements.length - 1].rx =  center_and_radius.rx
            this.elements[this.elements.length - 1].ry =  center_and_radius.ry



            case "rightup":
                case "leftdown":
                case "rightdown":
        }


    }


}
