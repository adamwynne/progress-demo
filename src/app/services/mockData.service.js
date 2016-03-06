(function () {
    'use strict';

    angular
        .module('app.services')
        .factory('mockDataService', mockDataService);

    mockDataService.$inject = ['$q', '$timeout', '_'];

    /* @ngInject */

    function mockDataService($q, $timeout, _) {
        var service = {
            getSuccess: getSuccess,
            getFailure: getFailure
        };

        return service;

        function getDelayedPromise(timeoutMs, onTimeoutDeferedFn) {
            var defered = $q.defer();

            $timeout(function() {
                onTimeoutDeferedFn(defered);
            }, timeoutMs);

            return defered.promise;
        }

        function getSuccess(timeoutMs) {
            return getDelayedPromise(timeoutMs, function(defered) {
                defered.resolve();
            });
        }

        function getFailure(timeoutMs) {
            return getDelayedPromise(timeoutMs, function(defered) {
                defered.reject();
            });
        }
    }
})();
