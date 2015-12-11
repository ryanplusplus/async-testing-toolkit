describe('Promise', function() {
   var mach = require('mach.js');
   var Toolkit = require('../index.js');
   var Promise;
   var loop;

   beforeEach(function() {
      var toolkit = Toolkit();
      Promise = toolkit.Promise;
      loop = toolkit.eventLoop;
   });

   it('should allow chaining', function() {
      new Promise(function() {})
         .then(() => 0)
         .catch(() => 0)
         .then(() => 0);
   });

   it('should resolve to the event loop', function() {
      var resolve;
      var p = new Promise(function(_resolve) {
         resolve = _resolve;
      });

      var cb = mach.mockFunction();
      p.then(cb);

      resolve(42);

      cb.shouldBeCalledWith(42).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should reject to the event loop', function() {
      var reject;
      var p = new Promise(function(_, _reject) {
         reject = _reject;
      });

      var cb = mach.mockFunction();
      p.catch(cb);

      reject(42);

      cb.shouldBeCalledWith(42).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should allow synchronous resolution', function() {
      var p = new Promise(function(resolve) {
         resolve(4);
      });

      var cb = mach.mockFunction();
      p.then(cb);

      cb.shouldBeCalledWith(4).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should allow synchronous rejection', function() {
      var p = new Promise(function(_, reject) {
         reject(4);
      });

      var cb = mach.mockFunction();
      p.catch(cb);

      cb.shouldBeCalledWith(4).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should synchronous rejection via a throw', function() {
     var p = new Promise(function() {
        throw 4;
     });

     var cb = mach.mockFunction();
     p.catch(cb);

     cb.shouldBeCalledWith(4).when(function() {
        while(!loop.empty()) loop.run();
     });
   });

   it('should allow chaining for Promise.all', function() {
      new Promise.all([new Promise(() => 0)])
         .then(() => 0)
         .catch(() => 0)
         .then(() => 0);
   });

   it('should resolve to the event loop for Promise.all', function() {
      var resolve;
      var p = new Promise(function(_resolve) {
         resolve = _resolve;
      });

      var cb = mach.mockFunction();
      Promise.all([p]).then(cb);

      resolve(42);

      cb.shouldBeCalledWith(mach.same([42])).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should reject to the event loop for Promise.all', function() {
      var reject;
      var p = new Promise(function(_, _reject) {
         reject = _reject;
      });

      var cb = mach.mockFunction();
      Promise.all([p]).catch(cb);

      reject(42);

      cb.shouldBeCalledWith(42).when(function() {
         while(!loop.empty()) loop.run();
      });
   });

   it('should resolve to an empty array when Promise.all is used with no promises', function() {
      var cb = mach.mockFunction();
      Promise.all([]).then(cb);

      cb.shouldBeCalledWith(mach.same([])).when(function() {
         while(!loop.empty()) loop.run();
      });
   });
});
