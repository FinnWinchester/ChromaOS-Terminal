(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Parameter').factory('ChromaOSTerminalParameter', ['ChromaOSTerminalBaseParameter', function(ChromaOSTerminalBaseParameter) {
    var id;

    var ChromaOSTerminalParameter = function() {
      ChromaOSTerminalBaseParameter.apply(this, arguments);
    };

    ChromaOSTerminalParameter.prototype = new ChromaOSTerminalBaseParameter();

    return ChromaOSTerminalParameter;
  }]);

})(window.angular);
