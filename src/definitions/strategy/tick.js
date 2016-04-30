// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#2jo335

Blockly.Blocks.tick = {
  init: function() {
    this.appendDummyInput()
        .appendField(i18n._("Tick Value"));
    this.setOutput(true, "Number");
    this.setColour(180);
    this.setTooltip(i18n._('Returns the tick value received by a strategy block'));
    this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki');
  },
	onchange: function(ev) {
		Bot.utils.getRelationChecker().inside_strategy(this, ev, 'Tick Value');
	},
};
