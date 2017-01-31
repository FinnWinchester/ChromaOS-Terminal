(function(angular) {
  'use strict';

  function ChromaOSTerminalDirective($rootScope, ChromaOSTerminalCommand, ChromaOSTerminalParameter, $timeout) {

    function $init($scope, $element, $controller) {
      $element.addClass('chromaos-terminal-wrapper');
      if (!$scope.tId) {
        $scope.tId = (Math.floor(Math.random() * 90000) + 10000);
      }

      $element.addClass('chromaos-terminal-' + $scope.tId);
      $element.find('.chromaos-terminal').attr('data-terminal-id', $scope.tId);
      $controller.$init($element.find('.chromaos-terminal'), $scope.commands);

      $rootScope.$on('chromaos-terminal.username.set', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$changeUsername(args.username);
        }
      });

      $rootScope.$on('chromaos-terminal.glue.set', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$changeGlue(args.glue);
        }
      });

      $rootScope.$on('chromaos-terminal.environment.set', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$changeEnvironment(args.environment);
        }
      });

      $rootScope.$on('chromaos-terminal.input.set', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$changeInput(args.input);
        }
      });

      $rootScope.$on('chromaos-terminal.username.reset', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$resetUsername();
        }
      });

      $rootScope.$on('chromaos-terminal.glue.reset', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$resetGlue();
        }
      });

      $rootScope.$on('chromaos-terminal.environment.reset', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$resetEnvironment();
        }
      });

      $rootScope.$on('chromaos-terminal.input.reset', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$resetInput();
        }
      });

      $rootScope.$on('chromaos-terminal.all.reset', function(e, args) {
        if (args.tId === $scope.tId) {
          $controller.$resetAll();
        }
      });
    }

    var directive = {
      restrict: 'EA',
      scope: {
        commands: '=',
        tId: '='
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

  ChromaOSTerminalDirective.$inject = ['$rootScope', 'ChromaOSTerminalCommand', 'ChromaOSTerminalParameter', '$timeout'];
})(window.angular);
