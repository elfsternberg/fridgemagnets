testCase  = require('nodeunit').testCase
require('./sat.coffee')

module.exports = testCase
    "TestAddition": (test) ->
        m = Math.vector.add {x: 1, y: 1}, {x: -1, y: -1}
        test.ok(m.x == 0 and m.y == 0)
        m = Math.vector.add {x: 1, y: 1}, {x: 1, y: 1}
        test.ok(m.x == 2 and m.y == 2)
        test.done()

    "TestScalar": (test) ->
        m = Math.vector.scalar({x: 2, y: 2}, 2)
        test.ok(m.x == 4 and m.y == 4)
        test.done()

    "TestMag2": (test) ->
        m = Math.vector.magnitude2({x: 2, y: 2})
        test.ok(m == 8)
        test.done()

    "TestMag": (test) ->
        m = Math.vector.magnitude({x: 2, y: 2})
        test.ok(m == Math.sqrt(8))
        test.done()

    "TestNormalize": (test) ->
        m = Math.vector.normalize({x: 5, y: 0})
        test.ok(m.x == 1 and m.y == 0)
        m = Math.vector.normalize({x: 0, y: 5})
        test.ok(m.x == 0 and m.y == 1)
        m = Math.vector.normalize({x: 4, y: 3})
        test.ok((m.x * m.x + m.y * m.y) == 1)
        test.done()
