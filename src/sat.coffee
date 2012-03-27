#Copyright (c) 2012 Elf M. Sternberg
#
# Much of the code here I would never have understood if it hadn't
# been for the patient work of Caleb Helbling
# (http://www.propulsionjs.com/), as well as the Wikipedia pages for
# the Separating Axis Theorem.  It took me a week to wrap my head
# around these ideas.
#
#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:
#
#The above copyright notice and this permission notice shall be included in
#all copies or substantial portions of the Software.
#
#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
#THE SOFTWARE.

Math.vector =
    add: (v1, v2) -> {x: (v1.x + v2.x), y: (v1.y + v2.y)}

    # Scale a given vector.
    scalar: (v, s) -> {x: (v.x * s), y: (v.y * s)}

    dot: (v1, v2) -> v1.x * v2.x + v1.y * v2.y

    magnitude2: (v) ->
        x = v.x
        y = v.y
        x * x + y * y

    magnitude: (v) -> Math.sqrt(Math.vector.magnitude2(v))

    normalize: (v) ->
        mag = Math.vector.magnitude(v)
        {x: (v.x / mag), y: (v.y / mag)}

    leftNormal: (v) -> {x: -v.y, y: v.x}



this.colliding = (shape1, shape2) ->

    # Return the axes of a shape.  In a polygon, each potential
    # separating axis is the normal to each edge.  For our purposes, a
    # "shape" is an array of points with the structure [{x: 0, y: 0}, .. ]
    # We assume that the final edge is from the last point back to the
    # first.

    genAxes = (shape) ->
        throw "Cannot handle non-polygons" if shape.length < 3

        # Calculate the normal of a single pair of points in the
        # shape.

        axis = (shape, pi) ->
            p1 = shape[pi]
            p2 = shape[if pi == (shape.length - 1) then 0 else pi + 1]
            edge = {x: p1.x - p2.x, y: p1.y - p2.y}
            Math.vector.normalize(Math.vector.leftNormal(edge))

        (axis(shape, i) for i in [0...shape.length])

    # Calculate the extremis of the shape "above" a given axis

    genProjection = (shape, axis) ->
        min = Math.vector.dot(axis, shape[0])
        max = min
        for i in [1...shape.length]
            p = Math.vector.dot(axis, shape[i])
            min = p if p < min
            max = p if p > max
        {min: min, max: max}

    axes1 = genAxes(shape1)
    axes2 = genAxes(shape2)
    axes = axes1.concat axes2
    for axis in axes
        proj1 = genProjection(shape1, axis)
        proj2 = genProjection(shape2, axis)
        if not ( \
             (proj1.min >= proj2.min and proj1.min <= proj2.max) or \
             (proj1.max >= proj2.min and proj1.max <= proj2.max) or \
             (proj2.min >= proj1.min and proj2.min <= proj1.max) or \
             (proj2.max >= proj1.min and proj2.max <= proj1.max))
                return false
    return true


