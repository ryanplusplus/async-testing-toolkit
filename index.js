var EventLoop = {};

EventLoop.empty = function() {
  return this._events.length === 0;
};

EventLoop.run = function() {
  if(!this.empty()) this._events.shift()();
};

EventLoop.push = function(event) {
  this._events.push(event);
};

module.exports = {
  EventLoop: function() {
    var o = Object.create(EventLoop);
    o._events = [];
    return o;
  }
};
