(function () {
    'use strict';

    angular
        .module('app.demo')
        .controller('DemoController', DemoController);

    DemoController.$inject = ['$q', 'Restangular', 'progressService', '$timeout', 'mockDataService', 'logger'];

    /* @ngInject */

    function DemoController($q, Restangular, progressService, $timeout, mockDataService, logger) {
        var vm = this;

        Restangular.setBaseUrl("http://data.companieshouse.gov.uk");

        vm.demoSpinner = function(progressId) {
            shortTimeout(progressId);
        };

        vm.demoAddClass = function(progressId) {
            Restangular.all("doc").one("company", "02050399.json")
                .withHttpConfig({progressId: progressId})
                .get()
                .then(function(result) {
                    vm.companiesHouse = Restangular.stripRestangular(result);
                });
        };

        vm.demoErrorClass = function(progressId) {
            Restangular.all("doc").one("wrong_endpoint", "02050399.json")
                .withHttpConfig({progressId: progressId})
                .get()
                .then(function(result) {
                    vm.companiesHouse = Restangular.stripRestangular(result);
                });
        };

        function shortTimeout(progressId) {
            progressService.start(progressId);
            $timeout(function() {
                progressService.stop(progressId);
            }, 2000);
        }
    }
})();
