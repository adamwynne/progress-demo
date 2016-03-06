(function() {
    'use strict';

    angular
        .module('investec.utils')
        .directive('invProgress', invProgress);

    invProgress.$inject = ['progressService', '_', 'jQuery'];

    /* @ngInject */

    function invProgress(progressService, _, jQuery) {

        var directive = {
            restrict: 'A',
            link: progressLink
        };

        function progressLink(scope, element, attrs) {

            var hideClass = "ng-hide";

            var state = {
                progressFns: getProgressFns(element),
                started: false,
                progressId: null,
                regId: null
            };


            ////////////////////////////////////////////////////////////////////////
            // Setup the events
            ////////////////////////////////////////////////////////////////////////

            attrs.$observe('invProgress', register);

            scope.$on('$destroy', unregister);

            ////////////////////////////////////////////////////////////////////////
            // Call the inits
            ////////////////////////////////////////////////////////////////////////

            state.progressFns.init();

            ////////////////////////////////////////////////////////////////////////

            function getProgressFns(elem) {

                var jqElem = jQuery(elem);

                var fns = {
                    inits: [_.noop],
                    starts: [setStarted],
                    stops: [setStopped]
                };

                if (_.has(attrs, "progressHide")) {

                    // Add the hide class when the event is started and
                    // remove when its stopped

                    fns.starts.push(_.bind(jqElem.addClass, jqElem, hideClass));
                    fns.stops.push(_.bind(jqElem.removeClass, jqElem, hideClass));

                } else if (_.has(attrs, "progressShow")) {

                    // Add the hide class immediately, remove when the event is started and
                    // then add it again when the event is stopped

                    fns.inits.push(_.bind(jqElem.addClass, jqElem, hideClass));
                    fns.starts.push(_.bind(jqElem.removeClass, jqElem, hideClass));
                    fns.stops.push(_.bind(jqElem.addClass, jqElem, hideClass));

                }

                if (_.has(attrs, "progressAddClasses")) {
                    fns.starts.push(_.bind(jqElem.addClass, jqElem, attrs.progressAddClasses));
                    fns.stops.push(_.bind(jqElem.removeClass, jqElem, attrs.progressAddClasses));
                }

                return {
                    init: _.flow.apply(fns, fns.inits),
                    start: _.flow.apply(fns, fns.starts),
                    stop: _.flow.apply(fns, fns.stops)
                }
            }

            function setStarted() {
                state.started = true;
            }

            function setStopped() {
                state.started = false;
            }

            function register(newProgressId) {
                unregister();
                state.progressId = newProgressId;
                state.regId = progressService.registerId(newProgressId, state.progressFns.start, state.progressFns.stop);
            }

            function unregister() {
                if (state.progressId) {

                    // Stop our stuff if started

                    if (state.started) {
                        state.progressFns.stop();
                    }

                    progressService.unregisterId(state.progressId, state.regId);
                    state.progressId = null;
                    state.regId = null;
                }
            }
        }

        return directive;
    }
})();
