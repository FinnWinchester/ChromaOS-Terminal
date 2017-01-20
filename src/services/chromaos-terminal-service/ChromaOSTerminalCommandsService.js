(function(angular) {
  'use strict';

  function ChromaOSTerminalCommandsService($q) {

    var findParameter = function(command, parameter, isLongVersion) {
      var index2;
      var index1 = command.parameters.findIndex(function(eachParameter) {
        index2 = eachParameter.options.findIndex(function(eachOption) {
          return (eachOption.option === parameter && ((isLongVersion && parameter.length > 1) || (!isLongVersion && parameter.length === 1)));
        });
        return (index2 !== -1);
      });
      return (index1 !== -1 ? {
        parameter: command.parameters[index1],
        specific: command.parameters[index1].options[index2]
      } : false);
    };

    function camelize(str) {
      var replaced = str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
      }).replace(/\s+/g, '').replace(/-/g, '');
      replaced = replaced.charAt(0).toLowerCase() + replaced.slice(1);
      return replaced;
    }

    function returnOutput(response) {
      // We need to compare it with 'false' because !response.result will return false
      // even when the response.result value is undefined, which we don't want.
      var output;
      if (!response || (response && response.result === false && !response.error)) {
        output = ['err'];
      } else if (response && !response.result && response.error) {
        output = [response.error];
      } else {
        output = response;
      }
      return output;
    }

    var parse = function(commands, input) {
      var defer = $q.defer();

      var found = false;
      var camelized;
      var i = 0;
      var splitted = input.split(' ');
      var output = [];
      while (!found && i < commands.length) {
        var command = angular.copy(commands[i]);
        if (command.command === splitted[0]) {
          found = true;
          if (splitted.length > 1) {
            for (var j = 1; j < splitted.length; j++) {
              var frag = splitted[j];
              var param;
              var paramValue;
              if (frag.substring(0, 2) === '--') {
                // Params with double line (multichar)
                frag = frag.substring(2);
                param = findParameter(command, frag, true);
                paramValue = false;
                if (param) {
                  if (param.specific.params.length > 0) {
                    if (j + param.specific.params.length < splitted.length) {
                      for (var iter1 = 0; iter1 < param.specific.params.length; iter1++) {
                        camelized = camelize(param.specific.params[iter1]);
                        command[camelized] = splitted[j + iter1 + 1];
                      }
                    } else {
                      defer.resolve(['Param --' + frag + ' needs a value.']);
                    }
                  }
                  camelized = camelize(splitted[j]);
                  command[camelized] = true;
                  // param.action(param, command, output, paramValue);
                } else {
                  defer.resolve(['--' + frag + ': Parameter not found.']);
                }
              } else if (frag.substring(0, 1) === '-') {
                // Params with single line (single char)
                frag = frag.substring(1);
                for (var k = 0; k < frag.length; k++) {
                  param = findParameter(command, frag[k], false);
                  paramValue = false;
                  if (param) {
                    if (param.specific.params.length > 0) {
                      if (j + param.specific.params.length < splitted.length) {
                        for (var iter2 = 0; iter2 < param.specific.params.length; iter2++) {
                          camelized = camelize(param.specific.params[iter2]);
                          command[camelized] = splitted[j + iter2 + 1];
                        }
                      } else {
                        defer.resolve(['Param --' + frag[k] + ' needs a value.']);
                      }
                    }
                    camelized = camelize(splitted[j]);
                    command[camelized] = true;
                    // param.action(param, command, output, paramValue);
                  } else {
                    defer.resolve(['-' + frag[k] + ': Parameter not found.']);
                  }
                }
              }
            }
          }

          /* jshint ignore:start */
          command.execute(output).then(function(response) {
            defer.resolve(returnOutput(response));
          });
          /* jshint ignore:end */
        }
        i++;
      }
      if (!found) {
        defer.resolve([splitted[0] + ': Command not found.']);
      }
      return defer.promise;
    };

    var factory = {
      parse: parse
    };

    return factory;
  }

  angular.module('ChromaOSTerminal.Services')

  .factory('ChromaOSTerminalCommandsService', ChromaOSTerminalCommandsService);

  ChromaOSTerminalCommandsService.$inject = ['$q'];
})(window.angular);
