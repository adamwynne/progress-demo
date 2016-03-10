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
            // attribute. Otherwise, if we had an isolate scope, and some other
            // element/attr wanted one, angular would crap out
            ////////////////////////////////////////////////////////////////////////

            var hideClass = 'progress-hide';

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

                var hideElem = _.bind(jqElem.addClass, jqElem, hideClass);
                var showElem = _.bind(jqElem.removeClass, jqElem, hideClass);

                if (_.has(attrs, 'invProgressHide')) {

                    // Add the hide class when the event is started and
                    // remove when its stopped

                    fns.starts.push(hideElem);
                    fns.stops.push(showElem);

                } else if (_.has(attrs, 'invProgressShow')) {

                    // Add the hide class immediately, remove when the event is started and
                    // then add it again when the event is stopped

                    fns.inits.push(hideElem);
                    fns.starts.push(showElem);
                    fns.stops.push(hideElem);
                }

                if (_.has(attrs, 'invProgressErrorHide')) {

                    // Add the hide class when the event is errored and
                    // remove when its stopped

                    fns.starts.push(showElem);
                    fns.errors.push(hideElem);

                } else if (_.has(attrs, 'invProgressErrorShow')) {

                    // Add the hide class immediately, remove when the event is started and
                    // then add it again when the event is errored

                    fns.inits.push(hideElem);
                    fns.starts.push(hideElem);
                    fns.errors.push(showElem);
                }

                if (_.has(attrs, 'invProgressLockDimensions')) {

                    var setDimensions = function(elem, width, height) {
                        elem.css('height', height);
                        elem.css('width', width);
                    };

                    fns.starts.push(_.bind(setDimensions, this, jqElem,
						jqElem.outerWidth() + 'px',
						jqElem.outerHeight() + 'px'));
                    fns.stops.push(_.bind(setDimensions, this, jqElem, '', ''));
                }

                if (_.has(attrs, 'invProgressDisable')) {
                    fns.starts.push(_.bind(jqElem.prop, jqElem, 'disabled', true));
                    fns.stops.push(_.bind(jqElem.prop, jqElem, 'disabled', false));
                }

                if (_.has(attrs, 'invProgressAddClasses')) {
                    fns.starts.push(_.bind(jqElem.addClass, jqElem, attrs.invProgressAddClasses));
                    fns.stops.push(_.bind(jqElem.removeClass, jqElem, attrs.invProgressAddClasses));
                }

                if (_.has(attrs, 'invProgressErrorAddClasses')) {
                    fns.starts.push(_.bind(jqElem.removeClass, jqElem, attrs.invProgressErrorAddClasses));
                    fns.errors.push(_.bind(jqElem.addClass, jqElem, attrs.invProgressErrorAddClasses));
                }

                return {
                    init: _.flow.apply(fns, fns.inits),
                    start: _.flow.apply(fns, fns.starts),
                    stop: _.flow.apply(fns, fns.stops),
                    error: _.flow.apply(fns, fns.errors)
                };
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

                    // Stop our stuff if started (so if we unreg from a started event, we 
					// stop but other still carry on)

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
