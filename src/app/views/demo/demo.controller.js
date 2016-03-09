(function () {
    'use strict';

    angular
        .module('app.demo')
        .controller('DemoController', DemoController);

    DemoController.$inject = ['$q', 'Restangular', 'progressService', '$timeout', 'mockDataService', 'logger'];

    /* @ngInject */

    function DemoController($q, Restangular, progressService, $timeout, mockDataService, logger) {
        var vm = this;

        ///////////////////////////////////////////////////////////////////////////////
        // Timeout-based functions
        ///////////////////////////////////////////////////////////////////////////////

        vm.demoTimeoutSuccess = function(progressId, timeoutMs) {
            timeoutAndCall(
                progressId,
                timeoutMs,
                _.bind(progressService.stop, vm, progressId));
        };

        vm.demoTimeoutError = function(progressId, timeoutMs) {
            timeoutAndCall(
                progressId,
                timeoutMs,
                _.bind(progressService.error, vm, progressId));
        };

        var calls = 0;

        vm.demoTimeoutAlternateError = function(progressId, timeoutMs) {
            var fn = ++calls % 2 ? progressService.error : progressService.stop;
            timeoutAndCall(
                progressId,
                timeoutMs,
                _.bind(fn, vm, progressId));
        };

        function timeoutAndCall(progressId, timeoutMs, callFn) {
            progressService.start(progressId);
            $timeout(callFn, timeoutMs || 2000);
        }

        ///////////////////////////////////////////////////////////////////////////////
        // $http-based functions
        ///////////////////////////////////////////////////////////////////////////////

        Restangular.setBaseUrl("http://data.companieshouse.gov.uk");

        vm.demoHttpSuccess = function(progressId) {
            getCompanyInfo("company", progressId);
        };

        vm.demoHttpError = function(progressId) {
            getCompanyInfo("wont_find", progressId);

        };

        function getCompanyInfo(endPoint, progressId) {
            vm.companiesHouse = null;
            return Restangular.all("doc").one(endPoint, "02050399.json")
                .withHttpConfig({progressId: progressId})
                .get()
                .then(function(result) {
                    vm.companiesHouse = Restangular.stripRestangular(result);
                });
        }
    }
})();
