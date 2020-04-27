import { Component } from '@angular/core';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'svg-editor';
    modes = [ {mode:"move", font:"arrows-alt"}, {mode:"ellipse", font:"circle"}, {mode:"square", font:"square"}]
    current_mode = "move"
    color = {r:0, g:0, b:0}

    elements = [ {kind: "ellipse", x:10, y:10, rx:20, ry:20, color:{ r:200, g:0, b:0} }, {kind: "square", x:100, y:100, rx:30, ry:20, color:{ r:0, g:200, b:0}} ];
    ifdrag = false
    svg_ifdrag = false
    svg_pos = {start: {x:0, y:0}, end: {x:0, y:0}}
    currentIndex= 0
    cursor_box_size = 8


    current_layer_index = -1
    if_layer_drag = false

    mode_click(event, mode) {
        this.current_mode = mode
    }

    svg_mouseup(event) {
        if (this.current_mode == "ellipse" ||  this.current_mode == "square" ) {

            this.svg_ifdrag = false
        }
    }

    rgb_color(color) {
        return `rgb(${color.r},${color.g},${color.b})`
    }

    svg_mousemove(event) {
        if (this.svg_ifdrag) {
            if (this.current_mode == "ellipse" || "square" ) {
                var endpoint = this.get_pos_in_svg(event)
                var cx = (this.svg_pos.start.x + endpoint.x)/2
                var cy = (this.svg_pos.start.y + endpoint.y)/2
                var rx = Math.abs(this.svg_pos.start.x - endpoint.x)/2
                var ry = Math.abs(this.svg_pos.start.y - endpoint.y)/2
                this.elements[this.elements.length - 1] =  { kind: this.current_mode, x:cx, y:cy, rx:rx, ry:ry, color:{r:0, g:0, b:0}}
            }
        }
    }

    svg_mousedown(event) {
        if (this.current_mode == "ellipse" || this.current_mode == "square") {
            this.svg_ifdrag = true
            this.svg_pos.start = this.get_pos_in_svg(event) 
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

            if (this.ifdrag && this.currentIndex == index) {
                var circle_info = this.get_pos_in_svg(event)
                this.elements[index].x = circle_info.x
                this.elements[index].y = circle_info.y


            }
        }
    }

    mousedown(event, index) {
        if (this.current_mode == "move") {
            this.ifdrag = true
            this.currentIndex = index
        }
    }


    layer_mouseup(event, index) {
        this.if_layer_drag = false
        var cur_element = this.elements[this.current_layer_index]
        this.elements.splice(this.current_layer_index, 1);
        this.elements.splice(index, 0, cur_element)
        this.current_layer_index = -1
    }

    layer_mousemove(event, index) {
        event.preventDefault()

        if (this.if_layer_drag && this.current_layer_index == index) {
            var circle_info = this.get_pos_in_svg(event)
            this.elements[index].x = circle_info.x
            this.elements[index].y = circle_info.y

        }
    }

    layer_mousedown(event, index) {
        event.preventDefault()
        this.if_layer_drag = true
        this.current_layer_index = index
    }


    get_pos_in_svg(event){
        var svg  = <any>document.getElementById('mysvg') 
        var pt = svg.createSVGPoint(), svgP, circle;
        pt.x = event.clientX;
        pt.y = event.clientY;
        svgP = pt.matrixTransform(svg.getScreenCTM().inverse());   
        return {x:svgP.x, y:svgP.y}
    }
}
