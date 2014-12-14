logItDown
===========
[![Build Status](https://travis-ci.org/transferwise/log-it-down.svg)](https://travis-ci.org/transferwise/log-it-down)
[![Coverage Status](https://coveralls.io/repos/transferwise/log-it-down/badge.png?branch=master)](https://coveralls.io/r/transferwise/log-it-down?branch=master)

**logItDown** is an **AngularJS** module that collects all your **$log** and **$exceptionHandler** messages into a service for later inspection.

This gives you a back-end look a like log, where you can see what happened before the exception.

## Installation

Download source via [bower](http://bower.io/).

````bash
bower install log-it-down --save
````

Add logItDown as a dependency to your app.

````javascript
angular.module('your-app', ['logItDown']);
````

If you have overridden **$log** or **$exceptionHandler** without delegating them to base services then you can call the **logCollector** service in those overriding methods.

````javascript
// Inject logCollector
$provide.decorator('$log', function (logCollector) {
	return {
		
		log: function () {
			logCollector.log(arguments);
			// Other stuff you do here
		},
		info: function(){
			logCollector.info(arguments);
			// ..
		},
		debug: function(){
			logCollector.debug(arguments);
			// ..
		},
		warn: function(){
			logCollector.warn(arguments);
			// ..
		},
		error: function () {
			logCollector.error(arguments);
			// ..
		},
	};
});

$provide.decorator('$exceptionHandler', function (logCollector) {
	return function(exception, cause) {
		logCollector.error(exception.message);
		// ..
	};
});
````

Now all logs and exceptions will be saved to **logCollector** service, without any further work from you.

## logCollector service methods

Collector methods take multiple arguments and save them as a `message` with a `type` and current `time`.

````javascript
logCollector.log(..);
logCollector.info(..);
logCollector.debug(..);
logCollector.warn(..);
logCollector.error(..);
````

Getter methods return saved logs. You can give them two arguments:
* `reset` Boolean - resets history when True
* `limit` Integer - returns last n logs

````javascript
// Returns [{time: "HH:mm:ss.sss dd-MM-yyyy", type: "type", message: "msg"}, ..]
logCollector.getHistory(reset, limit);

// Returns "HH:mm:ss.sss dd-MM-yyyy TYPE message\n.."
logCollector.getHistoryAsString(reset, limit); 
````

There is a limit on how many logs are saved. If this number is exceeded then it will start pushing out logs from front. Default limit is **100**, but you can set it by yourself with this method

````javascript
logCollector.setHistoryLimit(limit);
````

## Example usage

We are going to integrate this module with [Bugsnag](https://github.com/bugsnag/bugsnag-js) that captures our application JS errors. It is easy to collect all the log messages with **logItDown** and send them to **Bugsnag** as a `metadata`. More info [@Bugsnag](https://bugsnag.com/docs).

````javascript

// Overwriting $exceptionHandler where we send all exceptions to Bugsnag
angular.module('logItDownDemo').factory('$exceptionHandler', function (logCollector) {
	return function (exception, cause) {
		// This will create a new tab "History" with a log row @Bugsnag
		Bugsnag.metaData = {
			history: {
				// Gets last 10 log and resets collected data
				log: logCollector.getHistoryAsString(true, 10) 
			}
		};
		Bugsnag.notifyException(exception);
	};
});

angular.module('logItDownDemo').controller('DemoController', function ($scope, $log, logCollector) {
		$log.info('Initializing controller');

		$log.log('Defining data');
		$scope.data = null;

		if ($scope.data === null) {
			// logCollector service doesn't print messages to the browser console
			logCollector.warn('Data need to be a array'); 
			$scope.data = ['bit', 'bitbit'];
		}
		var elem = $scope.data.doSomething(); // Lets cause an exception

		// ..
	}
);
````

## License

[Apache 2.0 License](//github.com/transferwise/log-it-down/blob/master/LICENSE)
