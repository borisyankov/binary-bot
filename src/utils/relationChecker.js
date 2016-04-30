Bot.RelationChecker = function RelationChecker() {

	var getNumField = function getNumField(block, fieldName) {
		var field = block.getInputTargetBlock(fieldName);
		if (field !== null && field.type === 'math_number') {
			field = field.getFieldValue('NUM')
				.trim();
			return field;
		}
		return '';
	};

	var isInteger = function isInteger(amount) {
		return !isNaN(+amount) && parseInt(amount) === parseFloat(amount);
	};

	var isInRange = function isInRange(amount, min, max) {
		return !isNaN(+amount) && +amount >= min && +amount <= max;
	};

	var trade = function trade(_trade, ev) {
		if (ev.type === 'create') {
			if (Bot.config.ticktrade_markets.indexOf(Blockly.mainWorkspace.getBlockById(ev.blockId)
					.type) >= 0) {
				Bot.utils.broadcast('tour:submarket_created');
			}
			if (Bot.config.conditions.indexOf(Blockly.mainWorkspace.getBlockById(ev.blockId)
					.type) >= 0) {
				Bot.utils.broadcast('tour:condition_created');
			}
			if (Blockly.mainWorkspace.getBlockById(ev.blockId)
				.type === 'math_number') {
				Bot.utils.broadcast('tour:number');
			}
			if (Blockly.mainWorkspace.getBlockById(ev.blockId)
				.type === 'purchase') {
				Bot.utils.broadcast('tour:purchase_created');
			}
			if (Blockly.mainWorkspace.getBlockById(ev.blockId)
				.type === 'trade_again') {
				Bot.utils.broadcast('tour:trade_again_created');
			}
		}
		if (_trade.childBlocks_.length > 0 && Bot.config.ticktrade_markets.indexOf(_trade.childBlocks_[0].type) < 0) {
			Bot.utils.log(i18n._('The trade block can only accept submarket blocks'), 'warning');
			Array.prototype.slice.apply(_trade.childBlocks_)
				.forEach(function (child) {
					child.unplug();
				});
		} else if (_trade.childBlocks_.length > 0) {
			submarket(_trade.childBlocks_[0], ev);
			Bot.utils.broadcast('tour:submarket');
			if (ev.hasOwnProperty('newInputName')) {
				Bot.utils.addPurchaseOptions();
			}
		}
		var topParent = Bot.utils.findTopParentBlock(_trade);
		if (topParent !== null) {
			if (Bot.config.ticktrade_markets.indexOf(topParent.type) >= 0 || topParent.type === 'on_strategy' || topParent.type === 'on_finish') {
				Bot.utils.log(i18n._('The trade block cannot be inside binary blocks'), 'warning');
				_trade.unplug();
			}
		}
	};
	var submarket = function submarket(_submarket, ev) {
		if (_submarket.childBlocks_.length > 0 && Bot.config.conditions.indexOf(_submarket.childBlocks_[0].type) < 0) {
			Bot.utils.log(i18n._('Submarket blocks can only accept condition blocks'), 'warning');
			Array.prototype.slice.apply(_submarket.childBlocks_)
				.forEach(function (child) {
					child.unplug();
				});
		} else if (_submarket.childBlocks_.length > 0) {
			condition(_submarket.childBlocks_[0], ev, true);
		}
		if (_submarket.parentBlock_ !== null) {
			if (_submarket.parentBlock_.type !== 'trade') {
				Bot.utils.log(i18n._('Submarket blocks have to be added to the trade block'), 'warning');
				_submarket.unplug();
			}
		}
	};
	var condition = function condition(_condition, ev, calledByParent) {
		if (_condition.parentBlock_ !== null) {
			if (Bot.config.ticktrade_markets.indexOf(_condition.parentBlock_.type) < 0) {
				Bot.utils.log(i18n._('Condition blocks have to be added to submarket blocks'), 'warning');
				_condition.unplug();
			} else {
				Bot.utils.broadcast('tour:condition');
				if (!calledByParent) {
					if ((ev.type === 'change' && ev.element && ev.element === 'field') || (ev.type === 'move' && typeof ev.newInputName === 'string')) {
						var added = [];
						var duration = getNumField(_condition, 'DURATION');
						if (duration !== '') {
							if (!isInteger(duration) || !isInRange(duration, 5, 15)) {
								Bot.utils.log(i18n._('Number of ticks must be between 5 and 10'), 'warning');
							} else {
								Bot.utils.broadcast('tour:ticks');
								added.push('DURATION');
							}
						}
						var amount = getNumField(_condition, 'AMOUNT');
						if (amount !== '') {
							added.push('AMOUNT');
						}
						var prediction = getNumField(_condition, 'PREDICTION');
						if (prediction !== '') {
							if (!isInteger(prediction) || !isInRange(prediction, 0, 9)) {
								Bot.utils.log(i18n._('Prediction must be one digit'), 'warning');
							} else {
								added.push('PREDICTION');
							}
						}
						if (added.indexOf('AMOUNT') >= 0 && added.indexOf('DURATION') >= 0) {
							if (_condition.inputList.slice(-1)[0].name === 'PREDICTION') {
								if (added.indexOf('PREDICTION') >= 0) {
									Bot.utils.broadcast('tour:options');
								}
							} else {
								Bot.utils.broadcast('tour:options');
							}
						}
					}
				}
			}
		}
	};
	var inside_strategy = function inside_strategy(blockObject, ev, name) {
		var topParent = Bot.utils.findTopParentBlock(blockObject);
		if (topParent !== null && (topParent.type === 'on_finish' || topParent.type === 'trade')) {
			Bot.utils.log(name + ' ' + i18n._('must be added inside the strategy block'), 'warning');
			blockObject.unplug();
		} else if (topParent !== null && topParent.type === 'on_strategy') {
			if (blockObject.type === 'purchase') {
				Bot.utils.broadcast('tour:purchase');
			}
		}
	};
	var inside_finish = function inside_finish(blockObject, ev, name) {
		var topParent = Bot.utils.findTopParentBlock(blockObject);
		if (topParent !== null && (topParent.type === 'on_strategy' || topParent.type === 'trade')) {
			Bot.utils.log(name + ' ' + i18n._('must be added inside the finish block'), 'warning');
			blockObject.unplug();
		} else if (topParent !== null && topParent.type === 'on_finish') {
			if (blockObject.type === 'trade_again') {
				Bot.utils.broadcast('tour:trade_again');
			}
		}
	};
	return {
		trade: trade,
		submarket: submarket,
		condition: condition,
		inside_strategy: inside_strategy,
		inside_finish: inside_finish,
	};
};
