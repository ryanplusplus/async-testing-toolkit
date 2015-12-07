describe('EventLoop', function() {
   var mach = require('mach.js');
   var Toolkit = require('../index.js');
   var loop;

   beforeEach(function() {
      loop = Toolkit().eventLoop;
   });

   it('should be empty after initialization', function() {
      expect(loop.empty()).toBe(true);
   });

   it('should not blow up if run when empty', function() {
      loop.run();
   });

   it('should not be empty after adding an event', function() {
      loop.push(() => null);
      expect(loop.empty()).toBe(false);
   });

   it('should be able to execute a single event', function() {
      var event = mach.mockFunction();
      loop.push(event);

      event.shouldBeCalled()
         .when(function() {
            loop.run();
         });
   });

   it('should execute at most one event when run is called', function() {
      var e1 = mach.mockFunction();
      var e2 = mach.mockFunction();

      loop.push(e1);
      loop.push(e2);

      e1.shouldBeCalled()
         .when(function() {
            loop.run();
         });
   });

   it('should execute events in FIFO order', function() {
      var e1 = mach.mockFunction();
      var e2 = mach.mockFunction();
      var e3 = mach.mockFunction();

      loop.push(e1);
      loop.push(e2);
      loop.push(e3);

      e1.shouldBeCalled()
         .then(e2.shouldBeCalled())
         .then(e3.shouldBeCalled())
         .when(function() {
            loop.run();
            loop.run();
            loop.run();
         });
   });

   it('should execute an event only once', function() {
      var event = mach.mockFunction();
      loop.push(event);

      event.shouldBeCalled()
         .when(function() {
            loop.run();
            loop.run();
         });
   });

   it('should be empty after executing all events', function() {
      loop.push(() => null);
      loop.push(() => null);
      loop.run();
      loop.run();
      expect(loop.empty()).toBe(true);
   });
});
