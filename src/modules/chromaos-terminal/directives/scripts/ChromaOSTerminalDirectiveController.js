(function(angular) {
  'use strict';

  function ChromaOSTerminalDirectiveController($scope, $rootScope, $q, $timeout, ChromaOSTerminalCommandsService, ChromaOSTerminalCommand, ChromaOSTerminalParameter) {
    var $commands;
    var $element;
    var $enabled;

    var defaultUsername = 'chromaos';
    var username = defaultUsername;
    var defaultGlue = '@';
    var glue = defaultGlue;
    var defaultEnvironment = 'terminal';
    var environment = defaultEnvironment;
    var defaultInput = '>';
    var input = defaultInput;

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
      return username + glue + environment + input;
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

    // Changes the username
    $scope.changeUsername = function(newUsername) {
      this.username = newUsername;
    };

    // Changes the glue
    $scope.changeGlue = function(newGlue) {
      this.glue = newGlue;
    };

    // Changes the environment
    $scope.changeEnvironment = function(newEnvironment) {
      this.environment = newEnvironment;
    };

    // Changes the input
    $scope.changeInput = function(newInput) {
      this.input = newInput;
    };

    // Changes the username
    $scope.resetUsername = function() {
      this.username = defaultUsername;
    };

    // Changes the glue
    $scope.resetGlue = function() {
      this.glue = defaultGlue;
    };

    // Changes the environment
    $scope.resetEnvironment = function() {
      this.environment = defaultEnvironment;
    };

    // Changes the input
    $scope.resetInput = function() {
      this.input = defaultInput;
    };

  }

  angular.module('ChromaOSTerminal.Modules.Terminal')

    .controller('ChromaOSTerminalDirectiveController', ChromaOSTerminalDirectiveController);

  ChromaOSTerminalDirectiveController.$inject = ['$scope', '$rootScope', '$q', '$timeout', 'ChromaOSTerminalCommandsService', 'ChromaOSTerminalCommand', 'ChromaOSTerminalParameter'];
})(window.angular);
