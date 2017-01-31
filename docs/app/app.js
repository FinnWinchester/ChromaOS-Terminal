angular.module('myapp', ['ChromaOSTerminal'])

  .controller('ChromaOSController', ['$scope', '$rootScope', 'ChromaOSTerminalCommand', 'ChromaOSTerminalParameter', '$q', function($scope, $rootScope, ChromaOSTerminalCommand, ChromaOSTerminalParameter, $q) {
    $scope.commands = [];
    $scope.tId1 = (Math.floor(Math.random() * 90000) + 10000);

    var command = new ChromaOSTerminalCommand('Test', 'Test description', 'test', function(command, output) {
      var defer = $q.defer();

      // output.unshift('Test command');
      if (command.f || command.force) {
        output.push('Has force');
      }
      if (command.c || command.cheese) {
        output.push('Has cheese');
        if (command.cheese) {
          output.push('Cheese: ' + command.cheese);
        }
      }
      if ((command.s || command.sauce) && command.bbqSauce) {
        defer.resolve({
          result: false,
          error: 'You are an assh***!'
        });
      } else {
        output.push('Has sauce');
        if (command.s) {
          output.push('Sauce: yes');
        } else if (command.sauce) {
          output.push('Sauce: ' + command.sauceType);
        } else if (command.bbqSauce) {
          output.push('Sauce: Bbq');
        }
      }
      if (command.u) {
        output.push('Change username');
        $rootScope.$emit('chromaos-terminal.username.set', {
          username: command.newUsername,
          tId: $scope.tId1
        });
      }
      defer.resolve(output);
      return defer.promise;
    });
    command.addParameter(new ChromaOSTerminalParameter(['f', 'force'], 'Force'));
    command.addParameter(new ChromaOSTerminalParameter(['c', 'cheese'], 'Cheese'));
    command.addParameter(new ChromaOSTerminalParameter(['b', 'bread <origin>', 'default-bread'], 'Bread'));
    command.addParameter(new ChromaOSTerminalParameter(['s', 'sauce <sauce-type>', 'bbq-sauce'], 'Sauce'));
    command.addParameter(new ChromaOSTerminalParameter(['u <new-username>'], 'Set username'));
    $scope.commands.push(command);

    command = new ChromaOSTerminalCommand('Info', 'Info description', 'info', function(command, output) {
      var defer = $q.defer();

      if (command.u || command.user) {
        $rootScope.$emit('chromaos-terminal.username.set', {
          username: command.newUsername,
          tId: $scope.tId1
        });
      }

      if (command.g || command.glue) {
        $rootScope.$emit('chromaos-terminal.glue.set', {
          glue: command.newGlue,
          tId: $scope.tId1
        });
      }

      if (command.e || command.env) {
        $rootScope.$emit('chromaos-terminal.environment.set', {
          environment: command.newEnvironment,
          tId: $scope.tId1
        });
      }

      if (command.i || command.input) {
        $rootScope.$emit('chromaos-terminal.input.set', {
          input: command.newInput,
          tId: $scope.tId1
        });
      }

      if (command.reset) {
        $rootScope.$emit('chromaos-terminal.all.reset', {
          tId: $scope.tId1
        });
      }
      defer.resolve(output);
      return defer.promise;
    });
    command.addParameter(new ChromaOSTerminalParameter(['u <new-username>', 'user <new-username>'], 'Set username'));
    command.addParameter(new ChromaOSTerminalParameter(['g <new-glue>', 'glue <new-glue>'], 'Set glue'));
    command.addParameter(new ChromaOSTerminalParameter(['e <new-environment>', 'env <new-environment>'], 'Set environment'));
    command.addParameter(new ChromaOSTerminalParameter(['i <new-input>', 'input <new-input>'], 'Set input'));
    command.addParameter(new ChromaOSTerminalParameter(['reset'], 'Reset terminal'));
    $scope.commands.push(command);

  }]);
