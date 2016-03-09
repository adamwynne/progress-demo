(function() {
    'use strict';

    angular
        .module('investec.utils')
        .config(progressConfig);

    progressConfig.$inject = ['$httpProvider'];

    /* @ngInject */

    function progressConfig( $httpProvider ) {

        $httpProvider.interceptors.push( progressInterceptor );

        progressInterceptor.$inject = ['$q', 'progressService'];

        /* @ngInject */

        function progressInterceptor( $q, progressService ) {

            return {
                request: request,
                requestError: requestError,
                response: response,
                responseError: responseError
            };

            function request( config ) {
                if (config.progressId) {
                    progressService.start(config.progressId);
                }
                return config;
            }

            function requestError( rejection ) {
                return $q.reject( rejection );
            }

            function response( response ) {
                if (response.config.progressId) {
                    progressService.stop(response.config.progressId);
                }

                // Pass-through the resolution.

                return response;
            }

            function responseError( response ) {
                if (response.config.progressId) {
                    progressService.error(response.config.progressId);
                }

                // Pass-through the rejection.

                return $q.reject( response );
            }
        }
    }
})();
