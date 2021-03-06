/**
 * logItDown v0.1.2
 *
 * Copyright 2014 Transferwise Ltd
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
(function() {
	'use strict';

	angular.module('logItDown', []).config(['$provide', function ($provide) {

		$provide.decorator('$log', ['$delegate', 'logCollector', function ($delegate, logCollector) {
			return {
				log: function () {
					$delegate.log.apply(null, arguments);
					logCollector.log.apply(null, arguments);
				},
				info: function (){
					$delegate.info.apply(null, arguments);
					logCollector.info.apply(null, arguments);
				},
				debug: function (){
					$delegate.debug.apply(null, arguments);
					logCollector.debug.apply(null, arguments);
				},
				warn: function (){
					$delegate.warn.apply(null, arguments);
					logCollector.warn.apply(null, arguments);
				},
				error: function () {
					$delegate.error.apply(null, arguments);
					logCollector.error.apply(null, arguments);
				}
			};
		}]);
	}]);

	angular.module('logItDown').service('logCollector', ['$filter', function ($filter) {
		var history = [];
		var historyLimit = 100;

		this.log = function () {
			log(arguments, 'LOG');
		};

		this.info = function () {
			log(arguments, 'INFO');
		};

		this.debug = function () {
			log(arguments, 'DEBUG');
		};

		this.warn = function () {
			log(arguments, 'WARN');
		};

		this.error = function () {
			log(arguments, 'ERROR');
		};

		this.setHistoryLimit = function (limit) {
			historyLimit = limit;
		};

		this.getHistoryAsString = function (reset, limit) {
			return constructHistoryString(this.getHistory(reset, limit));
		};

		this.getHistory = function (reset, limit) {
			var ret = getLimitedHistory(limit);

			if (reset === true) {
				history = [];
			}
			return ret;
		};

		var log = function (message, type) {
			history.push({
				time: getTimeStamp(),
				type: type,
				message: parseLogMessage(message)
			});
			if (history.length > historyLimit) {
				history.shift();
			}
		};

		var parseLogMessage = function (args) {
			var message = [];

			for (var i = 0; i < args.length; i ++) {
				if (args[i] instanceof Error) {
					message.push(args[i].stack);
					break;
				} else if (typeof args[i] === 'object'){
					message.push(JSON.stringify(args[i]));
				} else {
					message.push(args[i]);
				}
			}
			return message.join('\n');
		};

		var getTimeStamp = function () {
			return $filter('date')(new Date(), 'HH:mm:ss.sss dd-MM-yyyy');
		};

		var formatLogType = function (type) {
			if (type.length === 3) {
				return '  ' + type + ' ';
			} else if (type.length === 4) {
				return ' ' + type + ' ';
			}
			return type + ' ';
		};

		var getLimitedHistory = function (limit) {
			var limitedHistory = [];
			limit = calculateLimit(limit);

			for (var i = history.length - 1; i >= limit; i --) {
				limitedHistory.push(history[i]);
			}
			return limitedHistory;
		};

		var calculateLimit = function (limit) {
			limit = !isNaN(limit) && limit > 0 && limit <= history.length ? limit : history.length;
			return history.length - limit;
		};

		var constructHistoryString = function (history) {
			var historyString = '';

			for (var i = 0; i < history.length; i ++) {
				historyString += logToString(history[i]) + '\n';
			}
			return historyString;
		};

		var logToString = function (log) {
			return log.time + ' ' + formatLogType(log.type) + ' ' + log.message;
		};
	}]);
})();