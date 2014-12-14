describe('logItDown module spec', function () {
	'use strict';

	var $log, service;

	beforeEach(module('logItDown'));

	beforeEach(inject(function (_$log_, logCollector) {
		$log = _$log_;
		service = logCollector;

		var mockDate = new Date(2014, 9, 26, 1, 2, 3, 443);

		spyOn(window, 'Date').and.callFake(function () {
			return mockDate;
		});
	}));

	describe('overriding $log', function () {

		it('should call logCollector service log method on $log.log()', function () {
			spyOn(service, 'log');
			$log.log('logging stuff');
			expect(service.log).toHaveBeenCalledWith('logging stuff');
		});

		it('should call logCollector service info method on $log.info()', function () {
			spyOn(service, 'info');
			$log.info('info');
			expect(service.info).toHaveBeenCalledWith('info');
		});

		it('should call logCollector service debug method on $log.debug()', function () {
			spyOn(service, 'debug');
			$log.debug('debugging', 'stuff');
			expect(service.debug).toHaveBeenCalledWith('debugging', 'stuff');
		});

		it('should call logCollector service warn method on $log.warn()', function () {
			spyOn(service, 'warn');
			$log.warn(['warning']);
			expect(service.warn).toHaveBeenCalledWith(['warning']);
		});

		it('should call logCollector service error method on $log.error()', function () {
			spyOn(service, 'error');
			$log.error({error:true});
			expect(service.error).toHaveBeenCalledWith({error:true});
		});
	});

	describe('logCollector service', function () {

		it('should save logs into history array as objects', function () {
			service.log('Logged message');

			expect(historyFirstLog().time).toBeDefined();
			expect(historyFirstLog().type).toBeDefined();
			expect(historyFirstLog().message).toBeDefined();
		});

		describe('all log methods will save data with correct type', function () {

			it('should have LOG type when using log method', function () {
				service.log('Logged message');
				expect(historyFirstLog().type).toBe('LOG');
			});

			it('should have INFO type when using info method', function () {
				service.info('Logged message');
				expect(historyFirstLog().type).toBe('INFO');
			});

			it('should have DEBUG type when using debug method', function () {
				service.debug('Logged message');
				expect(historyFirstLog().type).toBe('DEBUG');
			});

			it('should have WARN type when using warn method', function () {
				service.warn('Logged message');
				expect(historyFirstLog().type).toBe('WARN');
			});

			it('should have ERROR type when using log method', function () {
				service.error('Logged message');
				expect(historyFirstLog().type).toBe('ERROR');
			});
		});

		it('should log down current time with time and date', function () {
			service.log('Logged message');

			expect(historyFirstLog().time).toBe('01:02:03.443 26-10-2014');
		});

		describe('saving log messages', function () {

			it('should save log with no arguments as empty string', function () {
				service.log();
				expect(historyFirstLog().message).toBe('');
			});

			it('should save ordinary string as it is', function () {
				service.log('Logged message');
				expect(historyFirstLog().message).toBe('Logged message');
			});

			it('should stringify messages that contain objects', function () {
				service.log({
					test: {
						objects: 'now'
					}
				});
				expect(historyFirstLog().message).toBe('{"test":{"objects":"now"}}');
			});

			it('should stringify messages that contain arrays', function () {
				service.log(['bunch', 'off', ['stuff']]);
				expect(historyFirstLog().message).toBe('["bunch","off",["stuff"]]');
			});

			it('should concat multiple arguments into string separated with \n', function () {
				service.log('test', 'it', 'with multiple', 'arguments');
				expect(historyFirstLog().message).toBe('test\nit\nwith multiple\narguments');
			});
		});

		describe('getting log history', function () {

			it('should order logs DESC by date', function () {
				service.log('First log');
				service.log('Second log');
				service.log('Third log');

				var history = service.getHistory();

				expect(history[0].message).toBe('Third log');
				expect(history[1].message).toBe('Second log');
				expect(history[2].message).toBe('First log');
			});

			it('should reset history after requesting history from service', function () {
				service.log('Logged message');
				service.getHistory(true);

				expect(service.getHistory().length).toBe(0);
			});

			describe('limiting history', function () {

				it('should limit history with global limit', function () {
					service.setHistoryLimit(2);
					service.log('First log');
					service.info('Second log');
					service.debug('Third log');

					var history = service.getHistory();

					expect(history.length).toBe(2);
					expect(history[0].message).toBe('Third log');
					expect(history[1].message).toBe('Second log');
				});

				it('should limit wanted number of logs with legit argument', function () {
					service.log('First log');
					service.log('Second log');
					service.log('Third log');

					var history = service.getHistory(true, 2);

					expect(history.length).toBe(2);
					expect(history[0].message).toBe('Third log');
					expect(history[1].message).toBe('Second log');
				});

				it('should return all logs when limit is not legit', function () {
					service.log('First log');
					service.debug('Second log');

					expect(service.getHistory(100).length).toBe(2);
					expect(service.getHistory(-1).length).toBe(2);
					expect(service.getHistory(0).length).toBe(2);
					expect(service.getHistory('test').length).toBe(2);
				});
			});
		});

		describe('getting history as string', function () {

			it('should get history as string separated by \n', function () {
				service.info('Info log');
				service.log('Log log');
				service.error('Error log');

				expect(service.getHistoryAsString()).toBe(
					'01:02:03.443 26-10-2014 ERROR  Error log\n01:02:03.443 26-10-2014   LOG  Log log\n01:02:03.443 26-10-2014  INFO  Info log\n'
				);
			});

			it('should get 1 out of 2 log messages from history when limiting to 1', function () {
				service.log('Log log');
				service.error('Error log');

				expect(service.getHistoryAsString(false, 1)).toBe(
					'01:02:03.443 26-10-2014 ERROR  Error log\n'
				);
			});

			it('should reset history after get', function () {
				service.log('Log log');
				service.error('Error log');
				service.getHistoryAsString(true);

				expect(service.getHistory().length).toBe(0);
			});
		});

		var historyFirstLog = function () {
			var history = service.getHistory();
			return history[0];
		};
	});
});