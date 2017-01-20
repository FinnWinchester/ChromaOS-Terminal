(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Command').factory('ChromaOSTerminalBaseCommand', ['ChromaOSTerminalParameter', '$q', function(ChromaOSTerminalParameter, $q) {
    var name;
    var description;
    var command;
    var action;
    var parameters;

    var ChromaOSTerminalBaseCommand = function(name, description, command, action) {
      this.name = name;
      this.description = description;
      this.command = command;
      this.action = action;
      this.parameters = [];

      this.addParameter(new ChromaOSTerminalParameter(['h', 'help'], 'Help'));
    };

    ChromaOSTerminalBaseCommand.prototype.addParameter = function(parameter) {
      this.parameters.push(parameter);
    };

    ChromaOSTerminalBaseCommand.prototype.execute = function(output) {
      var defer = $q.defer();
      var tmp;
      if (this.h || this.help) {
        var toPrint = [];
        for (var i = 0; i < this.parameters.length; i++) {
          var param = this.parameters[i];
          var line = [];
          for (var j = 0; j < param.options.length; j++) {
            var option = param.options[j];
            tmp = (option.option.length > 1 ? '-' : '') + '-' + option.option;
            if (option.params.length > 0) {
              /* jshint ignore:start */
              option.params.map(function(optionParam) {
                tmp += ' <' + optionParam + '>';
              });
              /* jshint ignore:end */
            }
            line.push(tmp);
          }
          var joined = line.join(', ');
          output.push(joined + ': ' + param.description);
        }
        defer.resolve(output);
      } else {
        this.action(this, output).then(function(response) {
          defer.resolve(response);
        });
      }
      return defer.promise;
    };

    return ChromaOSTerminalBaseCommand;
  }]);

})(window.angular);
