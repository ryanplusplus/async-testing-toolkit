'use strict';

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

function Promise(eventLoop) {
   var SyncPromise = require('sync-promise');

   var P = function(fn) {
      if(typeof(fn) !== 'function') {
        return new P((resolve) => resolve(fn));
      }
      else {
         let syncPromise = new SyncPromise(function(resolve, reject) {
            try {
               fn((v) => eventLoop.push(() => resolve(v)), (v) => eventLoop.push(() => reject(v)));
            }
            catch(e) {
               eventLoop.push(() => reject(e));
            }
         });

         return {
            then: function(cb) {
               syncPromise = syncPromise.then(function(v) {
                  eventLoop.push(function() {
                     cb(v);
                  });
               });
               return this;
            },
            catch: function(cb) {
               syncPromise = syncPromise.catch(function(v) {
                  eventLoop.push(function() {
                     cb(v);
                  });
               });
               return this;
            }
         };
      }
   };

   P.all = function(promises) {
      if(promises.length === 0) {
         return new P(function(resolve) {
            eventLoop.push(resolve.bind(null, []));
         });
      }
      else {
        return SyncPromise.all(promises);
      }
   };

   return P;
}

module.exports = function() {
   let eventLoop = Object.create(EventLoop, {
      _events: {
         value: [],
         writable: true
      }
   });

   return {
      eventLoop: eventLoop,
      Promise: Promise(eventLoop)
   };
};
