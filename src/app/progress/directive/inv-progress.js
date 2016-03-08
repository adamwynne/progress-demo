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

            ////////////////////////////////////////////////////////////////////////
            // NOTE: We don't mutate scope here as we might be sharing the scope
            // on the element (notice the lack of isolate scope in the directive
            // defn)
            //
            // This just makes the directive more usable generally as it's an
            // attribute
            ////////////////////////////////////////////////////////////////////////

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
                    stops: [setStopped],
                    errors: [setStopped]
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

                if (_.has(attrs, "progressErrorHide")) {

                    // Add the hide class when the event is errored and
                    // remove when its stopped

                    fns.starts.push(_.bind(jqElem.removeClass, jqElem, hideClass));
                    fns.errors.push(_.bind(jqElem.addClass, jqElem, hideClass));

                } else if (_.has(attrs, "progressErrorShow")) {

                    // Add the hide class immediately, remove when the event is started and
                    // then add it again when the event is errored

                    fns.inits.push(_.bind(jqElem.addClass, jqElem, hideClass));
                    fns.starts.push(_.bind(jqElem.removeClass, jqElem, hideClass));
                    fns.errors.push(_.bind(jqElem.addClass, jqElem, hideClass));

                }

                if (_.has(attrs, "progressAddClasses")) {
                    fns.starts.push(_.bind(jqElem.addClass, jqElem, attrs.progressAddClasses));
                    fns.stops.push(_.bind(jqElem.removeClass, jqElem, attrs.progressAddClasses));
                }

                if (_.has(attrs, "progressErrorAddClasses")) {
                    fns.starts.push(_.bind(jqElem.removeClass, jqElem, attrs.progressErrorAddClasses));
                    fns.errors.push(_.bind(jqElem.addClass, jqElem, attrs.progressErrorAddClasses));
                }

                return {
                    init: _.flow.apply(fns, fns.inits),
                    start: _.flow.apply(fns, fns.starts),
                    stop: _.flow.apply(fns, fns.stops),
                    error: _.flow.apply(fns, fns.errors)
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
                state.regId = progressService.registerId(
                    newProgressId,
                    state.progressFns.start,
                    state.progressFns.stop,
                    state.progressFns.error);
            }

            function unregister() {
                if (state.progressId) {

                    // Stop our stuff if started (so if we unreg from a started event, we stop but other still carry on)

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
