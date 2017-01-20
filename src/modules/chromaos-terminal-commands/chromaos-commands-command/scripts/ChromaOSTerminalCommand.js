(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Command').factory('ChromaOSTerminalCommand', ['ChromaOSTerminalBaseCommand', function(ChromaOSTerminalBaseCommand, ChromaOSTerminalParameter) {

    var ChromaOSTerminalCommand = function() {
      ChromaOSTerminalBaseCommand.apply(this, arguments);
    };

    ChromaOSTerminalCommand.prototype = new ChromaOSTerminalBaseCommand();

    return ChromaOSTerminalCommand;
  }]);

})(window.angular);
