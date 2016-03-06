(function () {
    'use strict';

    angular
        .module('app.demo')
        .controller('DemoController', DemoController);

    DemoController.$inject = ['$q', 'progressService', '$timeout', 'mockDataService', 'logger'];

    /* @ngInject */

    function DemoController($q, progressService, $timeout, mockDataService, logger) {
        var vm = this;

        vm.demoSpinner = function(progressId) {
            shortTimeout(progressId);
        };

        vm.demoAddClass = function(progressId) {
            shortTimeout(progressId);
        };

        function shortTimeout(progressId) {
            progressService.start(progressId);
            $timeout(function() {
                progressService.stop(progressId);
            }, 2000);
        }
    }
})();
