(function() {
    'use strict';

    angular
        .module('app.shell')
        .controller('ShellController', ShellController);

    ShellController.$inject = [];

    /* @ngInject */

    function ShellController() {
        var vm = this;
    }
})();
