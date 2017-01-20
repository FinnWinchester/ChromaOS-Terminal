# ChromaOS Terminal

ChromaOS Terminal made for AngularJS by Finn Winchester.

[Online demo](https://finnwinchester.github.io/ChromaOS-Terminal/).

### Installation
Via Bower
```
bower install chromaos-terminal --save
```

## Get started

Include files in your ```index.html```:
```
<script src="bower_components/chromaos-terminal/dist/js/ChromaOSTerminal.min.js"></script>
<link href="bower_components/chromaos-terminal/dist/css/ChromaOSTerminal.min.css" rel="stylesheet" />
```

Add ```ChromaOSTerminal``` to your AngularJS project:
```
angular.module('YourProject', ['ChromaOSTerminal']);
```

## Usage

### Use the directive
```
<div chromaos-terminal commands='commands'></div>
```

### Parameters
- Commands: Array of commands executable by the terminal.

## SDK

### How to create Commands
Add ```ChromaOSTerminalCommand``` factory to your project:
```
angular.module('YourProject', ['ChromaOSTerminalCommand']);
```
Now you can create new commands with ```new ChromaOSTerminalCommand()```. Add them to an array and pass it to the directive.

##### Commands' constructor accepts 4 parameters
1. **Command name**: The name of the command (needed for the help itself).
2. **Command description**: The description of the command (needed for the help itself).
3. **Command instruction**: The command itself; the word needed to execute the action.
4. **Command action**: The action to execute. This will recieve:
	1. **Command**: The command being executed.
	2. **Output**: The current output as array of strings.

### How to create Parameters and add them to a command
Add ```ChromaOSTerminalParameter``` factory to your project:
```
angular.module('YourProject', ['ChromaOSTerminalParameter'])
```

Now you can create new commands with ```new ChromaOSTerminalParameter()```.

##### Parameters' constructor accepts 5 parameters
1. **Parameter name**: The name of the parameter (needed for the help itself).
2. **Parameter description**: The description of the parameter (needed for the help itself).
3. **Parameter instruction**: The parameter itself; the word needed to execute the action.
4. **Parameter valued**: This indicates whether the next word is this parameter's value (such as -u [username]). If a parameter is valued but value is not found it will shut down the execution.
5. **Parameter action**: The action to execute. This will recieve:
	1. **Parameter**: The parameter being executed.
	2. **Command**: The command whose parameter is being executed.
	3. **Output**: The current output as array of strings.
	4. **Parameter value**: The value of the parameter if it is valued. Otherwise *false*.

#### Notes
1. Every command will have default parameters, injected by the Module itself:
	1. **Parameter -h and --help**: This will output every parameter the command has, showing its name, description and parammeter instruction.
2. Every terminal will have default commands, injected by the Module itself:
	1. **clear**: This will reset the terminal output and make it like fresh-instancied.
	2. **exit**: This will ```$scope.$emit('chromaos-terminal.exit', {})``` so you can listen it and do stuff.
