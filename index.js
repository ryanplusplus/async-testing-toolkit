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
      let syncPromise = new SyncPromise(function(resolved, rejected) {
        fn((v) => eventLoop.push(() => resolved(v)), rejected);
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
   };

   P.all = function(promises) {
      if(promises.length === 0) {
         return new P(function(resolve) {
            eventLoop.push(resolve.bind(null, []));
         });
      }
      else {
         var promiseAll = SyncPromise.all(promises);

         return {
            then: function(cb) {
               promiseAll = promiseAll.then(function(v) {
                  eventLoop.push(function() {
                     cb(v);
                  });
               });
               return this;
            },
            catch: function(cb) {
               promiseAll = promiseAll.catch(function(v) {
                  eventLoop.push(function() {
                     cb(v);
                  });
               });
               return this;
            }
         };
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
