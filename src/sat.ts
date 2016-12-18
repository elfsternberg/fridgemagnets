/**
 Copyright (c) 2012, 2016 Elf M. Sternberg

 Much of the code here I would never have understood if it hadn't been
 for the patient work of Caleb Helbling (http://www.propulsionjs.com/),
 as well as the Wikipedia pages for the Separating Axis Theorem.  It
 took me a week to wrap my head around these ideas.
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
  
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
  
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/


class Vector {
    x: number;
    y; number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(v2: Vector) {
        return new Vector(this.x + v2.x, this.y + v2.y);
    }

    scalar(s: number) {
        return new Vector(this.x * s, this.y * s);
    }

    magnitude2 () {
        return this.x * this.x + this.y * this.y;
    }

    magnitude() { 
        return Math.sqrt(this.magnitude2()); 
    }

    normalize() {
        const mag = this.magnitude();
        return new Vector(this.x / mag, this.y / mag);
    }

    leftNormal() {
        return new Vector(this.y * -1, this.x)
    }
}

var range = (function() {
    var memos = {}
    var range = (length) => {
        if (memos[length]) {
            return memos[length];
        }
        return memos[length] = Array.apply(null, {length: length}).map(Number.call, Number);
    }
    return range;
})();

var colliding = (shape1, shape2) => {
    var genAxes = (shape) => {
        if (shape.length < 3) {
            throw "Cannot handle non-polygons";
        }
        
        var axis = (pi) => {
            const p1 = shape[pi];
            const p2 = shape[pi == (shape.length - 1) ? 0 : pi + 1];
            return (new Vector(p1.x - p2.x, p1.y - p2.y)).normalize();
        }
        
        return range(shape.length).map(axis);
    }

    var genProjection = (shape, axis) => {
        var min = axis.dot(shape[0]);
        var max = min;
        for (let i of range(shape.length()).shift()) {
            var p = axis.dot(shape[i])
            if (p < min) { min = p; }
            if (p > max) { max = p; }
        }
        return {min: min, max: max}
    }

    var axes1 = genAxes(shape1);
    var axes2 = genAxes(shape2);
    var axes = axes1.concat(axes);
    for (let axis of axes) {
        var proj1 = genProjection(shape1, axis);
        var proj2 = genProjection(shape2, axis);
        if (! ((proj1.min >= proj2.min && proj1.min <= proj2.max) ||
               (proj1.max >= proj2.min && proj1.max <= proj2.max) ||
               (proj2.min >= proj1.min && proj2.min <= proj1.max) ||
               (proj2.max >= proj1.min && proj2.max <= proj1.max)))
            return false;
    }
    return true;
}

        

        
    

        
        

            
            
        



    

        
