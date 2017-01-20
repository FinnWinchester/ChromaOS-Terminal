/* global $:false */
(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Kernel', [])

  .constant('$', $);

})(window.angular);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Services', []);

})(window.angular);
;(function(angular) {
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
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules', [
		'ChromaOSTerminal.Modules.Commands',
    'ChromaOSTerminal.Modules.Terminal'
  ]);

})(window.angular);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Command', []);

})(window.angular);
;(function(angular) {
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
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Command').factory('ChromaOSTerminalCommand', ['ChromaOSTerminalBaseCommand', function(ChromaOSTerminalBaseCommand, ChromaOSTerminalParameter) {

    var ChromaOSTerminalCommand = function() {
      ChromaOSTerminalBaseCommand.apply(this, arguments);
    };

    ChromaOSTerminalCommand.prototype = new ChromaOSTerminalBaseCommand();

    return ChromaOSTerminalCommand;
  }]);

})(window.angular);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Parameter', []);

})(window.angular);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands.Parameter').factory('ChromaOSTerminalBaseParameter', function() {

    var options;
    var description;
    var action;
    var expectsValues;

    var ChromaOSTerminalBaseParameter = function(options, description, action) {
      this.options = options || [];
      this.options = this.options.map(function(each) {
				var params = [];
        var tmp = each.match(/<[a-z\-]+>/g);
        var count = (tmp ? tmp.length : 0);
        for (var i = 0; i < count; i++) {
          params.push(tmp[i].replace('<', '').replace('>', ''));
        }
        var json = {
          option: each.split(' ')[0],
					description: description,
          params: params
        };
        return json;
      });
      this.description = description;
      this.action = action;
    };

    return ChromaOSTerminalBaseParameter;
  });

})(window.angular);
;(function(angular) {
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
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Commands', [
		'ChromaOSTerminal.Modules.Commands.Command',
		'ChromaOSTerminal.Modules.Commands.Parameter'
	]);

})(window.angular);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal.Modules.Terminal', []);

})(window.angular);
;(function(angular) {
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
;(function(angular) {
  'use strict';

  function ChromaOSTerminalDirectiveController($scope, $rootScope, $q, $timeout, ChromaOSTerminalCommandsService, ChromaOSTerminalCommand, ChromaOSTerminalParameter) {
    var $commands;
    var $element;
    var $enabled;
    var defaultUsername = 'chromaos';
    var username = defaultUsername;
    var glue = '@';
    var defaultEnv = 'terminal';
    var env = defaultEnv;
    var input = '>';
    var chromaOSTerminalLineClass = 'chromaos-terminal-line';
    var chromaOSTerminalLineNumberClass = 'chromaos-terminal-line-__id__';
    var chromaOSTerminalCursorClass = 'chromaos-terminal-cursor';
    var chromaOSTerminalCharacterClass = 'chromaos-terminal-character';
    var chromaOSTerminalCharacterNumberClass = 'chromaos-terminal-character-__id__';
    var chromaOSTerminalCharacterUnerasableClass = 'chromaos-terminal-character-unerasable';
    var lineCount = 0;
    var lineCharCount = 0;
    var currentLine = false;
    var currentInput = '';

    var history = [];
    var historyIndex = 0;

    // Returns line prompt like 'user@root>'
    $scope.getPrompt = function() {
      return username + glue + env + input;
    };

    // Returns a character wrapper
    $scope.getCharacter = function(character, unerasable) {
      var char = angular.element('<div></div>')
        .addClass(chromaOSTerminalCharacterClass)
        .html(character);
      if (unerasable) {
        char.addClass(chromaOSTerminalCharacterUnerasableClass);
      }
      return char;
    };

    // Returns a new cursor element
    $scope.getCursor = function() {
      return angular.element('<div></div>')
        .addClass(chromaOSTerminalCursorClass);
    };

    // Removes all cursors
    $scope.removeCursor = function() {
      angular.element('.' + chromaOSTerminalCursorClass).remove();
    };

    // Add a new line
    $scope.addLine = function() {
      var newLine = angular.element('<div></div>')
        .addClass(chromaOSTerminalLineClass)
        .addClass(chromaOSTerminalLineNumberClass.replace('__id__', lineCount));
      lineCount++;
      $element.append(newLine);
      return newLine;
    };

    // Add a new line
    $scope.emptyLine = function(line) {
      line.find('.' + chromaOSTerminalCharacterClass + ':not(.' + chromaOSTerminalCharacterUnerasableClass + ')').remove();
      return line;
    };

    // Places cursor at the end of the line
    $scope.placeCursor = function(line) {
      line.append($scope.getCursor());
    };

    // Adds a character to a line
    $scope.write = function(line, character, unerasable) {
      if (character === ' ') character = '&nbsp';
      line.append($scope.getCharacter(character, unerasable));
    };

    // Adds a text to a line
    $scope.writeText = function(line, text, unerasable) {
      for (var i = 0; i < text.length; i++) {
        $scope.write(line, text[i], unerasable);
      }
    };

    // Removes last character of a line
    $scope.backspace = function(line) {
      $scope.removeCursor();
      var char = line.find('.' + chromaOSTerminalCharacterClass + ':last-child');
      if (!char.hasClass(chromaOSTerminalCharacterUnerasableClass)) {
        char.remove();
        currentInput = currentInput.slice(0, -1);
      }
      $scope.placeCursor(currentLine);
    };

    $scope.parseInput = function(input) {
      var defer = $q.defer();
      ChromaOSTerminalCommandsService.parse($commands, input).then(function(response) {
        defer.resolve(response);
      });
      return defer.promise;
    };

    // Removes last character of a line
    $scope.enter = function() {
      var defer = $q.defer();
      var pendingToParse = angular.copy(currentInput);
      $scope.parseInput(pendingToParse).then(function(response) {
        defer.resolve(response);
      });
      currentInput = '';
      return defer.promise;
    };

    var scrollBottom = function() {
      angular.element($element).scrollTop(angular.element($element)[0].scrollHeight);
    };

    // Adds the prompt string
    $scope.writePrompt = function(line) {
      var prompt = $scope.getPrompt();
      $scope.writeText(line, prompt, true);
      scrollBottom();
    };

    // Paste current clipboard's value
    $scope.paste = function(value, line) {
      $scope.removeCursor();
      currentInput += value;
      $scope.writeText(line, value, false);
      scrollBottom();
      $scope.placeCursor(currentLine);
    };

    function onPasteFunction(e) {
      e.stopPropagation();
      e.preventDefault();
      var value = e.clipboardData.getData('Text');
      $scope.paste(value, currentLine);
    }

    // Makes (or makes not) a line writable
    $scope.makeWritable = function(status) {
      angular.element(document).unbind('keypress');
      angular.element(document).unbind('keydown');
      document.removeEventListener('paste', onPasteFunction);
      if (status) {
        document.addEventListener('paste', onPasteFunction);
        angular.element(document).on('keydown', function(e) {
          switch (e.which) {
            case 8:
              $scope.backspace(currentLine);
              break;
            case 38:
              e.preventDefault();
              if (historyIndex > 0) {
                historyIndex--;
                $scope.removeCursor();
                $scope.emptyLine(currentLine);
                $scope.writeText(currentLine, history[historyIndex]);
                currentInput = history[historyIndex];
                $scope.placeCursor(currentLine);
              }
              break;
            case 40:
              e.preventDefault();
              if (historyIndex < history.length - 1) {
                historyIndex++;
                $scope.removeCursor();
                $scope.emptyLine(currentLine);
                $scope.writeText(currentLine, history[historyIndex]);
                currentInput = history[historyIndex];
                $scope.placeCursor(currentLine);
              } else {
                $scope.removeCursor();
                $scope.emptyLine(currentLine);
                $scope.writeText(currentLine, '');
                $scope.placeCursor(currentLine);
              }
              break;
          }
        });
        angular.element(document).on('keypress', function(e) {
          var addedLine;
          switch (e.which) {
            case 13:
              $scope.removeCursor();
              history.push(currentInput);
              historyIndex++;
              $scope.enter().then(function(response) {
                if (response.length > 0) {
                  var i = 0;
                  do {
                    addedLine = $scope.addLine();
                    currentLine = addedLine;
                    $scope.writeText(currentLine, response[i], true);
                    i++;
                  } while (i < response.length);
                }
                addedLine = $scope.addLine();
                $scope.writePrompt(addedLine);
                $scope.write(addedLine, '', true);
                $scope.placeCursor(addedLine);
                currentLine = addedLine;
              });
              break;
            default:
              currentInput += String.fromCharCode(e.which);
              if (currentLine) {
                $scope.removeCursor();
                $scope.write(currentLine, String.fromCharCode(e.which));
                $scope.placeCursor(currentLine);
              }
              break;
          }
        });
      }
    };

    var addBaseCommands = function() {
      $commands.push(new ChromaOSTerminalCommand('Clear', 'Clear command', 'clear', function(command) {
        var defer = $q.defer();
        angular.element('.chromaos-terminal[data-terminal-id="' + $element.attr('data-terminal-id') + '"]').find('.' + chromaOSTerminalLineClass).remove();
        defer.resolve(true);
        return defer.promise;
      }));
      $commands.push(new ChromaOSTerminalCommand('Exit', 'Exit command', 'exit', function(command) {
        var defer = $q.defer();
        $scope.$emit('chromaos-terminal.exit', {});
        defer.resolve(true);
        return defer.promise;
      }));

      var prepared;
      var tmp;
      $commands.push(new ChromaOSTerminalCommand('Help', 'Help command', 'help', function(command, output) {
        var defer = $q.defer();

        $commands.map(function(eachCommand) {
          output.push(eachCommand.command + ': ' + eachCommand.description);
          eachCommand.parameters.map(function(eachParameter) {
            prepared = [];
            eachParameter.options.map(function(eachParameterOption) {
              tmp = (eachParameterOption.option.length > 1 ? '-' : '') + '-' + eachParameterOption.option;
              if (eachParameterOption.params.length > 0) {
                eachParameterOption.params.map(function(eachParameterOptionParam) {
                  tmp += ' <' + eachParameterOptionParam + '>';
                });
              }
              prepared.push(tmp);
            });
            output.push(prepared.join(', ') + ': ' + eachParameter.description);
          });
          output.push(' ');
        });

        defer.resolve(output);
        return defer.promise;
      }));

      var command = new ChromaOSTerminalCommand('History', 'History command', 'history', function(command, output) {
        var defer = $q.defer();
        var clonedHistory = angular.copy(history);
        clonedHistory.pop();
        var clonedI, modifiedI, maxHistory = Math.min(clonedHistory.length, 50);
        if (command.all && (command.m || command.max)) {
          defer.resolve({
            result: false,
            error: 'You can\'t use --all and (-m or --max).'
          });
        } else {
          if (command.all) {
            maxHistory = clonedHistory.length;
          } else if (command.m || command.max) {
            maxHistory = command.maxHistory;
          }
        }
        for (var i = 0; i < maxHistory; i++) {
          clonedI = clonedHistory[i];
          modifiedI = i + 1;
          output.push(modifiedI + ' ' + clonedI);
        }
        defer.resolve(output);
        return defer.promise;
      });
      command.addParameter(new ChromaOSTerminalParameter(['all'], 'Shows all history.'));
      command.addParameter(new ChromaOSTerminalParameter(['m <max-history>', 'max <max-history>'], 'Shows <max-history> history\'s entries.'));
      $commands.push(command);
    };

    // Initialize all
    this.$init = function(elm, commands) {
      $element = elm;
      $commands = angular.copy(commands);
      addBaseCommands();

      var addedLine = $scope.addLine();
      $scope.writePrompt(addedLine);
      $scope.write(addedLine, '', true);
      currentLine = addedLine;

      $timeout(function() {
        angular.element('.chromaos-terminal[data-terminal-id="' + $element.attr('data-terminal-id') + '"]').on('click', function(e) {
          e.stopPropagation();
          if (!$enabled) {
            $rootScope.$broadcast('chromaos-terminal.focus.in', {
              tId: $element.attr('data-terminal-id')
            });
            $scope.placeCursor(currentLine);
            $scope.makeWritable(true);
            $enabled = true;
          }
        });
      }, 0);

      $rootScope.$on('chromaos-terminal.focus.in', function(e, args) {
        if (args.tId !== $element.attr('data-terminal-id')) {
          $scope.removeCursor();
          $scope.makeWritable(false);
          $enabled = false;
        }
      });
    };

    $scope.modifyUsername = function(newUsername) {
      username = newUsername;
    };
    $scope.modifyEnv = function(newEnv) {
      env = newEnv;
    };
    $scope.resetUsername = function() {
      username = defaultUsername;
    };
    $scope.resetEnv = function() {
      env = defaultEnv;
    };

  }

  angular.module('ChromaOSTerminal.Modules.Terminal')

  .controller('ChromaOSTerminalDirectiveController', ChromaOSTerminalDirectiveController);

  ChromaOSTerminalDirectiveController.$inject = ['$scope', '$rootScope', '$q', '$timeout', 'ChromaOSTerminalCommandsService', 'ChromaOSTerminalCommand', 'ChromaOSTerminalParameter'];
})(window.angular);
;angular.module('ChromaOSTerminal.Templates', ['modules/chromaos-terminal/directives/views/ChromaOSTerminalDirectiveTemplate.html']);

angular.module("modules/chromaos-terminal/directives/views/ChromaOSTerminalDirectiveTemplate.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("modules/chromaos-terminal/directives/views/ChromaOSTerminalDirectiveTemplate.html",
    "<div class=\"chromaos-terminal\">\n" +
    "	\n" +
    "</div>\n" +
    "");
}]);
;(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal', [
    'ChromaOSTerminal.Kernel',
		'ChromaOSTerminal.Templates', // Needed when grunting templates (HTML2JS).
		'ChromaOSTerminal.Modules',
		'ChromaOSTerminal.Services'
	]);

})(window.angular);
