(function(angular) {
  'use strict';

  angular.module('ChromaOSTerminal', [
    'ChromaOSTerminal.Kernel',
		'ChromaOSTerminal.Templates', // Needed when grunting templates (HTML2JS).
		'ChromaOSTerminal.Modules',
		'ChromaOSTerminal.Services'
	]);

})(window.angular);
