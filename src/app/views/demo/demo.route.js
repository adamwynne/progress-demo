(function() {
    'use strict';

    angular
        .module('app.demo')
        .run(appRun);

    appRun.$inject = ['routerHelper'];
    /* @ngInject */
    function appRun(routerHelper) {
        routerHelper.configureStates(getStates());
    }

    function getStates() {
        return [
            {
                state: 'dashboard',
                config: {
                    url: '/',
                    templateUrl: 'app/views/demo/demo.html',
                    controller: 'DemoController',
                    controllerAs: 'vm',
                    title: 'demo'
                }
            }
        ];
    }
})();
