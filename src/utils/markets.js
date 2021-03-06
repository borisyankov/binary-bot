Bot.Markets = function Markets() {
	Bot.markets = {};
	Bot.markets.volatility = {};
	Bot.config.ticktrade_markets.forEach(function (market) {
		Bot.markets.volatility[market] = function (options) {
			Bot.server.symbol = market.toUpperCase();

			options.forEach(function (option) {
				option.symbol = Bot.server.symbol;
			});

			var submarket = function submarket(cb) {
				Bot.server.submitProposal(options[0]);
				Bot.server.submitProposal(options[1]);
			};

			return submarket;
		};
	});
};
