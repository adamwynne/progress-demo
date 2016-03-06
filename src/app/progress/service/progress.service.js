(function () {
    'use strict';

    angular
        .module('investec.utils')
        .factory('progressService', progressService);

    progressService.$inject = ['_'];

    /* @ngInject */

    function progressService(_) {

        var service = {
            registry: {},
            regId: 0,
            getStopFn: getStopFn,
            getStartFn: getStartFn,
            start: start,
            stop: stop,
            registerId: registerId,
            registerIds: registerIds,
            unregisterId: unregisterId,
            unregisterIds: unregisterIds
        };

        return service;

        /////////////////////////////////////////////////////////////////////////
        // Helper functions
        /////////////////////////////////////////////////////////////////////////

        function getStartFn(progressId) {
            return function () {
                start(progressId);
            };
        }

        function getStopFn(progressId) {
            return function () {
                stop(progressId);
            };
        }

        function registerIds(eventIds, startFn, stopFn) {
            _.each(eventIds, function (eventId) {
                registerId(eventId, startFn, stopFn);
            });
        }

        function unregisterIds(eventIds, startFn, stopFn) {
            _.each(eventIds, function (eventId) {
                unregisterId(eventId, startFn, stopFn);
            });
        }

        /////////////////////////////////////////////////////////////////////////
        // Progress functions
        /////////////////////////////////////////////////////////////////////////

        function start(eventId) {
            if (eventId) {
                //console.log("start: " + eventId);
                var event = getEvent(eventId);
                event.numStarters++;

                // If this is the first starter, call all the 'start' actions

                if (event.numStarters === 1) {
                    _.each(event.registrations, function (fns, regId) {
                        //console.log("start: " + eventId + "," + regId);
                        fns.start();
                    });
                }
            }
        }

        function stop(eventId) {
            if (eventId) {
                //console.log("stop: " + eventId);
                var event = getEvent(eventId);

                if (event) {

                    // If other starters still exist, then decr the reference count,
                    // otherwise call all the 'stop' actions

                    if (event.numStarters > 0) {
                        event.numStarters--;
                    }

                    if (event.numStarters === 0) {
                        _.each(event.registrations, function (fns, regId) {
                            //console.log("stop: " + eventId + "," + regId);
                            fns.stop();
                        });

                        cleanupIfNecessary(eventId);
                    }
                }
            }
        }

        /////////////////////////////////////////////////////////////////////////
        // Registration functions
        /////////////////////////////////////////////////////////////////////////

        function registerId(eventId, startFn, stopFn) {
            var regId = getNextRegId();

            var event = getEvent(eventId);

            if (_.isEmpty(event)) {
                event = createEvent(eventId);
            }

            event.registrations[regId] = {
                start: startFn,
                stop: stopFn
            };

            // If the event is started already, call start

            if (event.numStarters > 0) {
                startFn();
            }

            //console.log("reg: " + eventId + "," + regId);
            return regId;
        }

        function unregisterId(eventId, regId) {
            //console.log("unreg: " + eventId + "," + regId);

            var event = getEvent(eventId);

            if (event) {
                delete event.registrations[regId];
                cleanupIfNecessary(eventId);
            }
        }

        /////////////////////////////////////////////////////////////////////////
        // Internal functions
        /////////////////////////////////////////////////////////////////////////

        function getNextRegId() {
            return (service.regId++).toString();
        }

        function createEvent(eventId) {
            service.registry[eventId] = {
                numStarters: 0,
                registrations: {}
            };

            return service.registry[eventId];
        }

        function getEvent(eventId) {
            return service.registry[eventId];
        }

        function cleanupIfNecessary(eventId) {
            var event = getEvent(eventId);

            if (event) {
                if (_.isEmpty(event.registrations)) {
                    delete service.registry[eventId];
                    //console.log("total cleanup for event: " + eventId);
                }
            }
        }
    }
})();
