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
      return Object.create(EventLoop, {
         _events: {
            value: [],
            writable: true
         }
      });
   }
};
