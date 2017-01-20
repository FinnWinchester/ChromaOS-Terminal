(function(angular) {
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
