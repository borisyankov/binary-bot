// https://blockly-demo.appspot.com/static/demos/blockfactory/index.html#xq4ajc

Blockly.Blocks.contract_details = {
  init: function() {
    this.appendDummyInput()
        .appendField(i18n._("Contract Details"));
    this.setOutput(true, "Array");
    this.setColour(180);
    this.setTooltip(i18n._('Returns the list of details for the finished contract'));
    this.setHelpUrl('https://github.com/binary-com/binary-bot/wiki');
  },
	onchange: function(ev) {
		Bot.utils.getRelationChecker().inside_finish(this, ev, 'Contract Details');
	},
};
