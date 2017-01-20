(function(angular) {
  'use strict';

  function ChromaOSTerminalDirective(ChromaOSTerminalCommand, ChromaOSTerminalParameter) {

    var directive = {
      restrict: 'EA',
      scope: {
        commands: '='
      },
      templateUrl: 'modules/chromaos-terminal/directives/views/ChromaOSTerminalDirectiveTemplate.html',
      compile: function(element, attributes) {
        return {
          post: function($scope, $element, $attributes, $controller) {
            $element.addClass('chromaos-terminal-wrapper');
            var tId = (Math.floor(Math.random() * 90000) + 10000);
            $element.addClass('chromaos-terminal-' + tId);
            $element.find('.chromaos-terminal').attr('data-terminal-id', tId);
            $controller.$init($element.find('.chromaos-terminal'), $scope.commands);
          }
        };
      },
      controller: 'ChromaOSTerminalDirectiveController'
    };

    return directive;
  }

  angular.module('ChromaOSTerminal.Modules.Terminal')

  .directive('chromaosTerminal', ChromaOSTerminalDirective);

  ChromaOSTerminalDirective.$inject = ['ChromaOSTerminalCommand', 'ChromaOSTerminalParameter'];
})(window.angular);
