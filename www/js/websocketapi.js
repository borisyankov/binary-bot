var BinaryAPI = function BinaryAPI() {
	var dataStream = '';

	var waitForConnection = function (callback) {
		if (dataStream.readyState === 3) {
			init();
			setTimeout(function () {
				waitForConnection(callback);
			}, 1000);
		} else if (dataStream.readyState === 1) {
			callback();
		} else if (!(dataStream instanceof WebSocket)) {
			init();
			setTimeout(function () {
				waitForConnection(callback);
			}, 1000);
		} else {
			setTimeout(function () {
				waitForConnection(callback);
			}, 1000);
		}
	};

	var sendMessage = function (_data) {
		waitForConnection(function () {
			dataStream.send(JSON.stringify(_data));
		});
	};

	var init = function () {
		var language = 'en';

		dataStream = new WebSocket('wss://ws.binaryws.com/websockets/v3?l=' + language);

		dataStream.onopen = function () {
			console.log('socket is opened');
			sendMessage({
				ping: 1
			});
		};

		dataStream.onmessage = function (message) {
			receiveMessage(message);
		};

		dataStream.onclose = function (e) {
			console.log('socket is closed ', e);
			init();
			console.log('socket is reopened');
		};

		dataStream.onerror = function (e) {
			//console.log('error in socket ', e);
			if (e.target.readyState == 3) {}
		};

	};

	var authenticated = false;

	var callbacks = {
		authorize: function authorize(message){
			if ( message.authorize) {
				authenticated = true;
				console.log('authenticated successfully', message);
			} else {
				authenticated = false;
				console.log('failed to authenticate', message);
			}
		},
		contracts_for: function contracts_for(message){
			var symbol = message.echo_req.contracts_for;
			var groupedSymbol = message.contracts_for.available;
			console.log('groupedSymbol', groupedSymbol);
		},
	};

	var receiveMessage = function (_response) {
		var message = JSON.parse(_response.data);
		if (message) {
			var messageType = message.msg_type;
			if ( callbacks.hasOwnProperty(messageType) ) {
				callbacks[messageType](message);
			}
		}
	};

	var websocketService = {};

	websocketService.init = function () {
		setInterval(function restart() {
			if (!dataStream || dataStream.readyState === 3) {
				init();
			}
			return restart;
		}(), 1000);
	};

	websocketService.authenticate = function (_token, callback) {
		callbacks['authorize'] = callback;
		var data = {
			authorize: _token
		};

		sendMessage(data);
	};

	websocketService.sendRequestFor = {
		contractsForSymbol: function contractsForSymbol(_symbol) {
			var data = { 
				contracts_for: _symbol
			};
			sendMessage(data);
		},
	};
	return websocketService;
};
