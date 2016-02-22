/**
 * point.js
 *
 * Simple Point class.
 *
 * Any method that takes an x and y may also take a point.
 */

define([], function() {  
  const Point = function Point(x, y) {
    this.set(x, y);
  }
  
  Point.prototype = {
    clone: function clone() {
      return new Point(this.x, this.y);
    },
  
    set: function set(x, y) {
      this.x = x;
      this.y = y;
      return this;
    },
  
    equals: function equals(x, y) {
      return this.x == x && this.y == y;
    },
  
    toString: function toString() {
      return "(" + this.x + "," + this.y + ")";
    },
  
    map: function map(f) {
      this.x = f.call(this, this.x);
      this.y = f.call(this, this.y);
      return this;
    },
  
    add: function add(x, y) {
      this.x += x;
      this.y += y;
      return this;
    },
  
    subtract: function subtract(x, y) {
      this.x -= x;
      this.y -= y;
      return this;
    },
  
    scale: function scale(s) {
      this.x *= s;
      this.y *= s;
      return this;
    },
  
    isZero: function() {
      return this.x == 0 && this.y == 0;
    }
  };
  
  (function() {
    function takePointOrArgs(f) {
      return function(arg1, arg2) {
        if (arg2 === undefined)
          return f.call(this, arg1.x, arg1.y);
        else
          return f.call(this, arg1, arg2);
      };
    }
  
    for (let f of ['add', 'subtract', 'equals', 'set'])
      Point.prototype[f] = takePointOrArgs(Point.prototype[f]);
  })();
  

  return Point;
});
