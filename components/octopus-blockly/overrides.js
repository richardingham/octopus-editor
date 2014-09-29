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

Blockly.Css.inject = function () {};

/**
 * Initializes the toolbox.
 */
Blockly.Toolbox.init = function() {
  Blockly.Toolbox.CONFIG_['cleardotPath'] =
      Blockly.pathToBlockly + 'media/1x1.gif';
  Blockly.Toolbox.CONFIG_['cssCollapsedFolderIcon'] =
      'blocklyTreeIconClosed' + (Blockly.RTL ? 'Rtl' : 'Ltr');
  var tree = new Blockly.Toolbox.TreeControl(goog.html.SafeHtml.EMPTY,
                                             Blockly.Toolbox.CONFIG_);
  Blockly.Toolbox.tree_ = tree;
  tree.setShowRootNode(false);
  tree.setShowLines(false);
  tree.setShowExpandIcons(false);
  tree.setSelectedItem(null);

  Blockly.Toolbox.HtmlDiv.style.display = 'block';
  Blockly.Toolbox.flyout_.init(Blockly.mainWorkspace);
  Blockly.Toolbox.populate_();
  tree.render(Blockly.Toolbox.HtmlDiv);

  // If the document resizes, reposition the toolbox.
  goog.events.listen(window, goog.events.EventType.RESIZE,
                     Blockly.Toolbox.position_);
  Blockly.Toolbox.position_();
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

/**
 * Close tooltips, context menus, dropdown selections, etc.
 * @param {boolean=} opt_allowToolbox If true, don't close the toolbox.
 */
Blockly.hideChaff = function(opt_allowToolbox) {
  Blockly.Tooltip.hide();
  Blockly.WidgetDiv.hide();
  if (!opt_allowToolbox &&
      Blockly.Toolbox.flyout_ && Blockly.Toolbox.flyout_.autoClose) {
    Blockly.Toolbox.clearSelection();
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
  return !(e.target === Blockly.svg || e.target === document.body);
};

