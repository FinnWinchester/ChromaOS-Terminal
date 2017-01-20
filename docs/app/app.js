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
    defer.resolve(output);
    return defer.promise;
  });
  command.addParameter(new ChromaOSTerminalParameter(['f', 'force'], 'Force'));
  command.addParameter(new ChromaOSTerminalParameter(['c', 'cheese <origin> <remote>'], 'Cheese'));
  command.addParameter(new ChromaOSTerminalParameter(['b', 'bread <origin>', 'aa-bb-cc'], 'Cheese'));
  command.addParameter(new ChromaOSTerminalParameter(['s', 'sauce <sauce-type>', 'bbq-sauce'], 'Cheese'));
  $scope.commands.push(command);

  command = new ChromaOSTerminalCommand('Git', 'Git command', 'git', function(command, output) {
    var defer = $q.defer();
    if (command.push && command.origin && command.remote) {
      output.push(`Git push <origin: ${command.origin}> <remote: ${command.remote}>`);
    }
    defer.resolve(output);
    return defer.promise;
  });
  command.addParameter(new ChromaOSTerminalParameter(['push <origin> <remote>'], 'Push from <origin> to <remote>.'));
  $scope.commands.push(command);

  command.addParameter(new ChromaOSTerminalParameter(['request <origin>'], 'Makes a request from <origin>.'));
  $scope.commands.push(command);

}]);
