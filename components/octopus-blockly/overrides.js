/**
 * Initialize the SVG document with various handlers.
 * @param {!Element} container Containing element.
 * @param {Object} opt_options Optional dictionary of options.
 */
Blockly.inject = function(polymer_element, container, opt_options) {
  // Store a reference to the polymer <octopus-editor> element
  Blockly.polymerElement_ = polymer_element;
  
  if (opt_options) {
    Blockly.parseOptions_(opt_options);
  }
  var startUi = function() {
    Blockly.createDom_(container);
	//Blockly.polymerElement_.$.blocklyWidget.appendChild(Blockly.WidgetDiv.DIV);
    Blockly.init_();
  };
  if (Blockly.enableRealtime) {
    var realtimeElement = document.getElementById('realtime');
    if (realtimeElement) {
      realtimeElement.style.display = 'block';
    }
    Blockly.Realtime.startRealtime(startUi, container, Blockly.realtimeOptions);
  } else {
    startUi();
  }
};


/**
 * Fill the toolbox with categories and blocks.
 * @private
 */
Blockly.Toolbox.populate_ = function() {
	// Iterate over each category.
	var toolbox = [];

	var filterChildNodesByTag = function (node, name) { 
		return node.childNodes.array().filter(function (node) { 
			return node.tagName && node.tagName.toLowerCase() == name; 
		});
	}
	var nodes = filterChildNodesByTag(Blockly.languageTree, 'category');

	nodes.forEach(function (node) {
	    var custom = node.getAttribute('custom');

        toolbox.push ({
			name: node.getAttribute('name'),
			icon: node.getAttribute('icon') || 'settings',
			blocks: custom ? custom : filterChildNodesByTag(node, 'block')
		});
    })

	Blockly.polymerElement_.toolbox = toolbox;

	// Fire a resize event since the toolbox may have changed width and height.
	Blockly.fireUiEvent(window, 'resize');
};

Blockly.Variables = {};
Blockly.Variables.NAME_TYPE = "VARIABLES";


/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  Blockly.FieldFlydown.hide();
  if (!opt_allowToolbox &&
      Blockly.Toolbox.flyout_ && Blockly.Toolbox.flyout_.autoClose) {
	Blockly.polymerElement_.fire('close-toolbox');
	// Don't think this should need to be called...
	Blockly.Toolbox.flyout_.hide();
  }
};

/**
 * Is this event targeting a text input widget?
 * @param {!Event} e An event.
 * @return {boolean} True if text input.
 * @private
 */
Blockly.isTargetInput_ = function(e) {
  // Changed: Polymer element events bubble up with type as 'octopus-editor'.
  // The only keyboard events we should need to cancel are those coming from 'body'.
  // Also need to check for Blockly.svg (editor background) or <rect> (bubbles).
  return !(e.currentTarget === Blockly.svg || e.target === document.body || e.currentTarget.tagName === "rect");
};


Blockly.machineNamePrefix = "machine"; // Todo - extract to lang
Blockly.showPrefixToUser = true;


/******************************************************************************
[lyn, 12/23-27/2012, patch 16]
 Prefix labels for parameters, locals, and index variables,
 Might want to experiment with different combintations of these. E.g.,
 + maybe all non global parameters have prefix "local" or all have prefix "param".
 + maybe index variables have prefix "index", or maybe instead they are treated as "param"
*/

  Blockly.globalNamePrefix = "global"; // For names introduced by global variable declarations
  Blockly.procedureParameterPrefix = "input"; // For names introduced by procedure/function declarations
  Blockly.handlerParameterPrefix = "input"; // For names introduced by event handlers
  Blockly.localNamePrefix = "local"; // For names introduced by local variable declarations
  Blockly.loopParameterPrefix = "item"; // For names introduced by for loops
  Blockly.loopRangeParameterPrefix = "counter"; // For names introduced by for range loops




  