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
  Blockly.FieldFlydown.hide();
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
  return !(e.currentTarget === Blockly.svg || e.target === document.body);
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

  Blockly.menuSeparator = " "; // Separate prefix from name with this. E.g., space in "param x"
  Blockly.yailSeparator = "_"; // Separate prefix from name with this. E.g., underscore "param_ x"

  // Curried for convenient use in field_lexical_variable.js
  Blockly.possiblyPrefixMenuNameWith = // e.g., "param x" vs "x"
    function (prefix) {
      return function (name) {
        return (Blockly.showPrefixToUser ? (prefix + Blockly.menuSeparator) : "") + name;
      }
    };

  Blockly.possiblyPrefixMenuName = function (menuitem) {
    if (Array.isArray(menuitem) && menuitem.length > 1) {
	  var prefix = menuitem[0];
	  var name = (
	  	Blockly.showPrefixToUser || prefix === Blockly.globalNamePrefix ?
	  	(prefix + Blockly.menuSeparator) : 
	  	""
	  ) + menuitem[1];
	  menuitem[0] = menuitem[1] = name;
	}

    return menuitem;
  };

  // Curried for convenient use in generators/yail/variables.js
  Blockly.possiblyPrefixYailNameWith = // e.g., "param_x" vs "x"
    function (prefix) {
      return function (name) {
        return (Blockly.usePrefixInYail ? (prefix + Blockly.yailSeparator) : "") + name;
      }
    };

  Blockly.prefixGlobalMenuName = function (name) {
    return Blockly.globalNamePrefix + Blockly.menuSeparator + name;
  };

  // Return a list of (1) prefix (if it exists, "" if not) and (2) unprefixed name
  Blockly.unprefixName = function (name) {
    if (name.indexOf(Blockly.globalNamePrefix + Blockly.menuSeparator) == 0) {
      // Globals always have prefix, regardless of flags. Handle these specially
      return [Blockly.globalNamePrefix, name.substring(Blockly.globalNamePrefix.length + Blockly.menuSeparator.length)];
    } else if (!Blockly.showPrefixToUser) {
      return ["", name];
    } else {
      var prefixes = [Blockly.procedureParameterPrefix,
                      Blockly.handlerParameterPrefix,
                      Blockly.localNamePrefix,
					  Blockly.machineNamePrefix,
                      Blockly.loopParameterPrefix,
                      Blockly.loopRangeParameterPrefix]
      for (i=0; i < prefixes.length; i++) {
        if (name.indexOf(prefixes[i]) == 0) {
          // name begins with prefix
          return [prefixes[i], name.substring(prefixes[i].length + Blockly.menuSeparator.length)]
        }
      }
      // Really an error if get here ...
      return ["", name];
    }
  }

/******************************************************************************/

/******************************************************************************
Patch to enable new custom flyout menus.
*/
/**
 * Find all user-created procedure definitions.
 * @return {!Array.<!Array.<!Array>>} Pair of arrays, the
 *     first contains procedures without return variables, the second with.
 *     Each procedure is defined by a three-element list of name, parameter
 *     list, and return value boolean.
 */
Blockly.Procedures.allProcedures = function() {
  var blocks = Blockly.mainWorkspace.getAllBlocks();
  var sequencesReturn = [];
  var proceduresReturn = [];
  var proceduresNoReturn = [];
  for (var x = 0; x < blocks.length; x++) {
    var func = blocks[x].getProcedureDef;
    if (func) {
      var tuple = func.call(blocks[x]);
      if (tuple) {
        if (tuple[2] == "sequence") {
          sequencesReturn.push(tuple);
        } else if (tuple[2]) {
          proceduresReturn.push(tuple);
        } else {
          proceduresNoReturn.push(tuple);
        }
      }
    }
  }

  proceduresNoReturn.sort(Blockly.Procedures.procTupleComparator_);
  proceduresReturn.sort(Blockly.Procedures.procTupleComparator_);
  return [proceduresNoReturn, proceduresReturn, sequencesReturn];
};

/**
 * Construct the blocks required by the flyout for the procedure category.
 * @param {!Array.<!Blockly.Block>} blocks List of blocks to show.
 * @param {!Array.<number>} gaps List of widths between blocks.
 * @param {number} margin Standard margin width for calculating gaps.
 * @param {!Blockly.Workspace} workspace The flyout's workspace.
 */
Blockly.Procedures.flyoutCategory = function(blocks, gaps, margin, workspace) {
  var defaultBlocks = ['procedures_defnoreturn', 'procedures_defreturn', 'procedures_ifreturn', 'procedures_namedsequence'];
  for (var x = 0; x < defaultBlocks.length; x++) {
    if (Blockly.Blocks[defaultBlocks[x]]) {
      var block = Blockly.Block.obtain(workspace, defaultBlocks[x]);
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }
  if (gaps.length) {
    // Add slightly larger gap between system blocks and user calls.
    gaps[gaps.length - 1] = margin * 3;
  }

  function populateProcedures(procedureList, templateName) {
    for (var x = 0; x < procedureList.length; x++) {
      var block = Blockly.Block.obtain(workspace, templateName);
      block.setFieldValue(procedureList[x][0], 'NAME');
      var tempIds = [];
      for (var t = 0; t < procedureList[x][1].length; t++) {
        tempIds[t] = 'ARG' + t;
      }
      block.setProcedureParameters(procedureList[x][1], tempIds);
      block.initSvg();
      blocks.push(block);
      gaps.push(margin * 2);
    }
  }

  var tuple = Blockly.Procedures.allProcedures();
  populateProcedures(tuple[0], 'procedures_callnoreturn');
  populateProcedures(tuple[1], 'procedures_callreturn');
  populateProcedures(tuple[2], 'procedures_callnamedsequence');
};

/******************************************************************************/
  

  