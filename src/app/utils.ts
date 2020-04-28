
export function get_pos_in_svg(event){
        var svg  = <any>document.getElementById('mysvg') 
        var pt = svg.createSVGPoint(), svgP, circle;
        pt.x = event.clientX;
        pt.y = event.clientY;
        svgP = pt.matrixTransform(svg.getScreenCTM().inverse());   
        return {x:svgP.x, y:svgP.y}
 }
