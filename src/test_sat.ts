var testCase = require('nodeunit').testCase;
var Vector = require('./sat').Vector;

module.exports = testCase({
    "TestAddition": (test) => {
        var m = (new Vector(1, 1)).add(new Vector(-1, -1));
        test.ok(m.x == 0 && m.y == 0);
        var n = (new Vector(1, 1)).add(new Vector(1, 1));
        test.ok(n.x == 2 && n.y == 2);
        test.done();
    },

    "TestScalar": (test) => {
        var m = (new Vector(2, 2)).scalar(2);
        test.ok(m.x == 4 && m.y == 4);
        test.done();
    },

    "TestMag2": (test) => {
        var m = (new Vector(2, 2)).magnitude2();
        test.ok(m == 8);
        test.done();
    },

    "TestMag": (test) => {
        var m = (new Vector(2, 2)).magnitude();
        test.ok(m == Math.sqrt(8));
        test.done();
    },

    "TestNormalize": (test) => {
        var m = (new Vector(5, 0)).normalize();
        test.ok(m.x == 1 && m.y == 0);
        m = (new Vector(0, 5)).normalize();
        test.ok(m.x == 0 && m.y == 1);
        m = (new Vector(4, 3)).normalize().magnitude2();
        test.ok(m == 1);
        test.done();
    }
});
