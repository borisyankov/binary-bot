Bot.View = function View(on_load) {
	var workspace;
	$.get('www/xml/toolbox.xml', function (toolbox) {
		workspace = Blockly.inject('blocklyDiv', {
			media: 'node_modules/blockly/media/',
			toolbox: i18n.xml(toolbox.getElementsByTagName('xml')[0]),
			zoom: {
				controls: true,
				wheel: false,
				startScale: 1.0,
				maxScale: 3,
				minScale: 0.3,
				scaleSpeed: 1.2
			},
			trashcan: true,
		});
		$.get('www/xml/main.xml', function (main) {
			Blockly.Xml.domToWorkspace(main.getElementsByTagName('xml')[0], workspace);
			Blockly.mainWorkspace.getBlockById('trade')
				.setDeletable(false);
			Blockly.mainWorkspace.getBlockById('strategy')
				.setDeletable(false);
			Blockly.mainWorkspace.getBlockById('finish')
				.setDeletable(false);
			Bot.utils.updateTokenList();
			Bot.utils.addPurchaseOptions();
			Blockly.mainWorkspace.clearUndo();
			if ( on_load ) {
				on_load();
			}
		});
	});

	var handleFileSelect = function handleFileSelect(e) {
		var files;
		if (e.type === 'drop') {
			e.stopPropagation();
			e.preventDefault();
			files = e.dataTransfer.files;
		} else {
			files = e.target.files;
		}
		files = Array.prototype.slice.apply(files);
		var file = files[0];
		if (file) {
			if (file.type.match('text/xml')) {
				readFile(file);
			} else {
				Bot.utils.log(i18n._('File is not supported:' + ' ') + file.name, 'info');
			}
		}
	};

	var readFile = function readFile(f) {
		reader = new FileReader();
		reader.onload = (function (theFile) {
			return function (e) {
				try {
					Blockly.mainWorkspace.clear();
					var xml = Blockly.Xml.textToDom(e.target.result);
					Blockly.Xml.domToWorkspace(xml, Blockly.mainWorkspace);
					Bot.utils.addPurchaseOptions();
					var tokenList = Bot.utils.getStorageManager()
						.getTokenList();
					if (tokenList.length !== 0) {
						Blockly.mainWorkspace.getBlockById('trade')
							.getField('ACCOUNT_LIST')
							.setValue(tokenList[0].token);
						Blockly.mainWorkspace.getBlockById('trade')
							.getField('ACCOUNT_LIST')
							.setText(tokenList[0].account_name);
					}
					Blockly.mainWorkspace.clearUndo();
					Blockly.mainWorkspace.zoomToFit();
					Bot.utils.log(i18n._('Blocks are loaded successfully'), 'success');
				} catch (err) {
					Bot.utils.showError(err);
				}
			};
		})(f);
		reader.readAsText(f);
	};

	var handleDragOver = function handleDragOver(e) {
		e.stopPropagation();
		e.preventDefault();
		e.dataTransfer.dropEffect = 'copy';
	};

	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
	document.getElementById('files')
		.addEventListener('change', handleFileSelect, false);

	$('#tutorialButton')
		.bind('click', Bot.startTutorial);
	$('#stopButton')
		.text(i18n._('Reset'));
	$('#stopButton')
		.bind('click', Bot.reset);

	$('#summaryPanel .exitPanel')
		.click(function () {
			$(this)
				.parent()
				.hide();
		});

	$('#summaryPanel')
		.hide();

	$('#summaryPanel')
		.drags();

	$('#chart')
		.mousedown(function (e) { // prevent chart to trigger draggable
			e.stopPropagation();
		});

	$('table')
		.mousedown(function (e) { // prevent tables to trigger draggable
			e.stopPropagation();
		});

	Bot.showTrades();

	var BinaryChart = window['binary-charts'].PlainChart;
	Bot.chart = BinaryChart('chart', {
		ticks: []
	});

	Bot.uiComponents = {
		tutorialList: '.tutorialList',
		logout: '.logout',
		workspace_inside: 'svg > .blocklyWorkspace > .blocklyBlockCanvas',
		workspace: '.blocklyWorkspace',
		toolbox: '.blocklyToolboxDiv',
		file_management: '.intro-file-management',
		token: '.intro-token',
		run_stop: '.intro-run-stop',
		trash: '.blocklyTrash',
		undo_redo: '.intro-undo-redo',
		summary: '.intro-summary',
		center: '#center',
		flyout: '.blocklyFlyoutBackground',
		submarket: ".blocklyDraggable:contains('Submarket'):last",
		strategy: ".blocklyDraggable:contains('Strategy'):last",
		finish: ".blocklyDraggable:contains('Finish'):last",
	};

	Bot.doNotHide = ['center', 'flyout', 'workspace_inside', 'trash', 'submarket', 'strategy', 'finish'];

	Bot.getUiComponent = function getUiComponent(component) {
		return $(Bot.uiComponents[component]);
	};

};
