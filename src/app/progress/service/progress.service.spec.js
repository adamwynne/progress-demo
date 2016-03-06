/* jshint -W117, -W030 */
describe('progressService', function() {

    var getTestState = function() {
        var newObj = {
            started: false,
            startCalled: 0,
            stopCalled: 0,
            eventId: 'myEvent'
        };
        newObj.start = function() {
            newObj.started = true;
            newObj.startCalled++;
        };
        newObj.stop = function() {
            newObj.started = false;
            newObj.stopCalled++;
        };
        return newObj;
    };

    beforeEach(function() {
        bard.appModule('investec.utils');
        bard.inject('_');
    });

    it('should exist',
        inject(function(progressService) {
            expect(progressService).to.exist;
        }));

    it('should have an empty registry',
        inject(function(progressService) {
            expect(progressService.registry).to.be.an('object');
            expect(progressService.registry).to.be.empty;
        }));

    it('should have a regId starting at 0',
        inject(function(progressService) {
            expect(progressService.regId).to.equal(0);
        }));

    it('should correctly register an event',
        inject(function(progressService) {
            var testState = getTestState();

            // Register our event

            var regId = progressService.registerId(testState.eventId, _.noop, _.noop);

            expect(regId).to.equal('0');
            expect(progressService.registry[testState.eventId]).to.exist;
            expect(progressService.registry[testState.eventId].registrations[regId]).to.exist;
            expect(progressService.registry[testState.eventId].registrations[regId].start).to.equal(_.noop);
            expect(progressService.registry[testState.eventId].registrations[regId].stop).to.equal(_.noop);
        }));

    it('should correctly unregister an eventId',
        inject(function(progressService) {
            var testState = getTestState();

            // Register and unregister our event

            var regId = progressService.registerId(testState.eventId, _.noop, _.noop);
            progressService.unregisterId(testState.eventId, regId);

            // Check our unregistration

            expect(progressService.registry[testState.eventId]).to.not.exist;
        }));

    it('should handle two registrations with the same eventId',
        inject(function(progressService) {
            var testState = getTestState();

            // Register our event

            var regId0 = progressService.registerId(testState.eventId, _.noop, _.noop);
            var regId1 = progressService.registerId(testState.eventId, _.noop, _.noop);

            expect(regId0).to.equal('0');
            expect(regId1).to.equal('1');
            expect(progressService.registry[testState.eventId]).to.exist;

            expect(progressService.registry[testState.eventId].registrations[regId0]).to.exist;
            expect(progressService.registry[testState.eventId].registrations[regId0].start).to.equal(_.noop);
            expect(progressService.registry[testState.eventId].registrations[regId0].stop).to.equal(_.noop);

            expect(progressService.registry[testState.eventId].registrations[regId1]).to.exist;
            expect(progressService.registry[testState.eventId].registrations[regId1].start).to.equal(_.noop);
            expect(progressService.registry[testState.eventId].registrations[regId1].stop).to.equal(_.noop);

        }));

    it('should handle two unregistrations with the same eventId',
        inject(function(progressService) {
            var testState = getTestState();

            // Register our event

            var regId0 = progressService.registerId(testState.eventId, _.noop, _.noop);
            var regId1 = progressService.registerId(testState.eventId, _.noop, _.noop);

            // Single unreg should not remove the event from the registry

            progressService.unregisterId(testState.eventId, regId0);
            expect(progressService.registry[testState.eventId]).to.exist;

            // Two should remove the event

            progressService.unregisterId(testState.eventId, regId1);
            expect(progressService.registry[testState.eventId]).to.not.exist;
        }));

    it('should start and stop the event correctly',
        inject(function(progressService) {
            var testState = getTestState();

            expect(testState.started).to.be.false;

            // Register our event

            progressService.registerId(testState.eventId, testState.start, testState.stop);

            // Start our event

            progressService.start(testState.eventId);
            expect(testState.started).to.be.true;

            // Stop the event

            progressService.stop(testState.eventId);
            expect(testState.started).to.be.false;
        }));

    it('should not stop the event when the only starter deregisters',
        inject(function(progressService) {
            var testState = getTestState();

            // Register our event

            var regId = progressService.registerId(testState.eventId, testState.start, testState.stop);

            // Start our event

            progressService.start(testState.eventId);
            expect(testState.started).to.be.true;

            // Unregister from the event

            progressService.unregisterId(testState.eventId, regId);

            // Stopping the event should now not affect the state

            progressService.stop(testState.eventId);
            expect(testState.started).to.be.true;
        }));

    it('registering for an event that is already started should call the start on the new registrant',
        inject(function(progressService) {

            // Register and start our event

            var testState0 = getTestState();
            var regId0 = progressService.registerId(testState0.eventId, testState0.start, testState0.stop);
            progressService.start(testState0.eventId);
            expect(testState0.started).to.be.true;

            // New registration our event should start upon registration

            var testState1 = getTestState();
            expect(testState1.started).to.be.false;
            var regId1 = progressService.registerId(testState1.eventId, testState1.start, testState1.stop);
            expect(testState1.started).to.be.true;
        }));

    it('should start/stop the event correctly for multiple registrants',
        inject(function(progressService) {

            // Register the two registrants

            var testState0 = getTestState();
            var regId0 = progressService.registerId(testState0.eventId, testState0.start, testState0.stop);

            var testState1 = getTestState();
            var regId1 = progressService.registerId(testState1.eventId, testState1.start, testState1.stop);

            // Starting the event should start them both

            progressService.start(testState0.eventId);
            expect(testState0.started).to.be.true;
            expect(testState0.startCalled).to.equal(1);
            expect(testState1.started).to.be.true;
            expect(testState1.startCalled).to.equal(1);

            // Calling it again, should not call either registrant's start again

            progressService.start(testState0.eventId);
            expect(testState0.startCalled).to.equal(1);
            expect(testState1.startCalled).to.equal(1);

            // Stopping the event should stop them both
            // TODO: take away the numStarters I think

            progressService.stop(testState0.eventId);
            //expect(testState0.started).to.be.false;
            //expect(testState0.stopCalled).to.equal(1);
            //expect(testState1.started).to.be.false;
            //expect(testState1.stopCalled).to.equal(1);

        }));

    it('should call start/stop the event correctly for multiple registrants',
        inject(function(progressService) {

            // Register the two registrants

            var testState0 = getTestState();
            var regId0 = progressService.registerId(testState0.eventId, testState0.start, testState0.stop);

            var testState1 = getTestState();
            var regId1 = progressService.registerId(testState1.eventId, testState1.start, testState1.stop);

            // Starting the event should start them both

            progressService.start(testState0.eventId);
            expect(testState0.started).to.be.true;
            expect(testState1.started).to.be.true;

            // Stopping the event should stop them both

            progressService.stop(testState0.eventId);
            expect(testState0.started).to.be.false;
            expect(testState1.started).to.be.false;

        }));
});
