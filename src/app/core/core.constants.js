/* global toastr:false, moment:false, _:false */
(function() {
    'use strict';

    angular
        .module('app.core')
        .constant('_', _)
        .constant('toastr', toastr)
        .constant('moment', moment);
})();
