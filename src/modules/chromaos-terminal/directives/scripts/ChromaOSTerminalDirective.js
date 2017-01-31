(function(angular) {
  'use strict';

  function ChromaOSTerminalDirective(ChromaOSTerminalCommand, ChromaOSTerminalParameter, $timeout) {

    function $init($scope, $element, $controller) {
      $element.addClass('chromaos-terminal-wrapper');
      var tId = (Math.floor(Math.random() * 90000) + 10000);
      $element.addClass('chromaos-terminal-' + tId);
      $element.find('.chromaos-terminal').attr('data-terminal-id', tId);
      $controller.$init($element.find('.chromaos-terminal'), $scope.commands);

      $scope.$on('chromaos-terminal.username.set', function(e, args) {
        $controller.$changeUsername(args.username);
      });

      $scope.$on('chromaos-terminal.glue.set', function(e, args) {
        $controller.$changeGlue(args.glue);
      });

      $scope.$on('chromaos-terminal.environment.set', function(e, args) {
        $controller.$changeEnvironment(args.environment);
      });

      $scope.$on('chromaos-terminal.input.set', function(e, args) {
        $controller.$changeInput(args.input);
      });

      $scope.$on('chromaos-terminal.username.reset', function(e, args) {
        $controller.$resetUsername();
      });

      $scope.$on('chromaos-terminal.glue.reset', function(e, args) {
        $controller.$resetGlue();
      });

      $scope.$on('chromaos-terminal.environment.reset', function(e, args) {
        $controller.$resetEnvironment();
      });

      $scope.$on('chromaos-terminal.input.reset', function(e, args) {
        $controller.$resetInput();
      });
    }

    var directive = {
      restrict: 'EA',
      scope: {
        commands: '='
      },
      templateUrl: 'modules/chromaos-terminal/directives/views/ChromaOSTerminalDirectiveTemplate.html',
      compile: function(element, attributes) {
        return {
          post: function($scope, $element, $attributes, $controller) {
            $init($scope, $element, $controller);
          }
        };
      },
      controller: 'ChromaOSTerminalDirectiveController'
    };

    return directive;
  }

  angular.module('ChromaOSTerminal.Modules.Terminal')

    .directive('chromaosTerminal', ChromaOSTerminalDirective);

  ChromaOSTerminalDirective.$inject = ['ChromaOSTerminalCommand', 'ChromaOSTerminalParameter', '$timeout'];
})(window.angular);
