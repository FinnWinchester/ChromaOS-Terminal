angular.module('myapp', ['ChromaOSTerminal'])

  .controller('ChromaOSController', ['$scope', 'ChromaOSTerminalCommand', 'ChromaOSTerminalParameter', '$q', '$', function($scope, ChromaOSTerminalCommand, ChromaOSTerminalParameter, $q, $) {
    $scope.commands = [];

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

  }]);
