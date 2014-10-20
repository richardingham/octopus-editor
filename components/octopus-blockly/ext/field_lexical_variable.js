// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2013-2014 MIT, All rights reserved
// Released under the MIT License https://raw.github.com/mit-cml/app-inventor/master/mitlicense.txt
/**
 * @license
 * @fileoverview Drop-down chooser of variables in the current lexical scope for App Inventor
 * @author fturbak@wellesley.com (Lyn Turbak)
 * @author mail@richardingham.net (Richard Ingham)
 */

'use strict';


/**
 * Class for a variable's dropdown field.
 * @param {!string} varname The default name for the variable.  If null,
 *     a unique variable name will be generated.
 * @extends Blockly.FieldDropdown
 * @constructor
 */
Blockly.FieldLexicalVariable = function(varname, forSetter) {
  this.menuGenerator_ = Blockly.FieldLexicalVariable.dropdownCreate;
  this.arrow_ = Blockly.createSvgElement("tspan", {}, null);
  this.arrow_.appendChild(document.createTextNode(Blockly.RTL ? Blockly.FieldDropdown.ARROW_CHAR + " " : " " + Blockly.FieldDropdown.ARROW_CHAR));

  Blockly.FieldDropdown.super_.call(this, " ")

  if (varname) {
    this.setText(varname);
  } else {
    this.setText(Blockly.Variables.generateUniqueName());
  }

  this.forSetter_ = !!forSetter;
};
inherits(Blockly.FieldLexicalVariable, Blockly.FieldDropdown);

/**
 * Get the variable's name (use a variableDB to convert into a real name).
 * Unline a regular dropdown, variables are literal and have no neutral value.
 * @return {string} Current text.
 */
Blockly.FieldLexicalVariable.prototype.getValue = function() {
  return (this.value_ && this.value_.trim()) ? this.text_ + '@@' + this.value_ : this.text_;
};

Blockly.FieldLexicalVariable.prototype.getFullVariableName = function() {
  return this.value_;
};

/**
 * Set the variable name.
 * @param {string} text New text.
 */
Blockly.FieldLexicalVariable.prototype.setValue = function (variable) {
  if (this.block_ && this.block_.isInFlyout) {
    var i1 = variable.indexOf('::');
    var i2 = variable.indexOf('@@');
    if (i1 >= 0 && i2 >= 0 && i2 < i1) {
	  this.value_ = variable.substring(2 + i2);
	  this.setText(variable.substring(0, i2));
	  return;
	}
	this.value_ = variable;
	this.setText(variable);
	return;
  }
  if (typeof variable === "string" && this.block_) {
    var i1 = variable.indexOf('::');
    var i2 = variable.indexOf('@@');
    if (i1 >= 0 && i2 >= 0 && i2 < i1) {
	  this.value_ = variable.substring(2 + i2);
	  this.setText(variable.substring(0, i2));
	  return;
	} else {
      var scope = this.block_.getVariableScope();
      var scopedVariable = scope.getScopedVariable(variable);
	  if (scopedVariable) {
	    variable = scopedVariable;
	  }
	}
  }
  if (!variable || typeof variable === "string") {
    this.value_ = variable || "";
    this.setText(variable || "");
    return;
  }
  if (this.block_.setVarType_) {
	this.block_.setVarType_(variable.getType());
  }
  this.value_ = variable.getName();
  this.setText(variable.getDisplay());
  // Blockly.WarningHandler.checkErrors.call(this.sourceBlock_);
};


/**
 * Get the block holding this drop-down variable chooser
 * @return {string} Block holding this drop-down variable chooser. 
 */
Blockly.FieldLexicalVariable.prototype.getBlock = function() {
  return this.block_; 
};

/**
 * Set the block holding this drop-down variable chooser. Also initializes the cachedParent.
 * @param {string} block Block holding this drop-down variable chooser
 */
Blockly.FieldLexicalVariable.prototype.setBlock = function(block) {
  this.block_ = block;
  this.setCachedParent(block.getParent());
};

/**
 * Get the cached parent of the block holding this drop-down variable chooser
 * @return {string} Cached parent of the block holding this drop-down variable chooser. 
 */
Blockly.FieldLexicalVariable.prototype.getCachedParent = function() {
  return this.cachedParent_; 
};

/**
 * Set the cached parent of the block holding this drop-down variable chooser. 
 * This is used for detecting when the parent has changed in the onchange event handler. 
 * @param {string} Parent of the block holding this drop-down variable chooser
 */
Blockly.FieldLexicalVariable.prototype.setCachedParent = function(parent) {
  this.cachedParent_ = parent;
};

/**
 * @this A FieldLexicalVariable instance
 * @returns {list} A list of all global and lexical names in scope at the point of the getter/setter
 *   block containing this FieldLexicalVariable instance. Global names are listed in sorted
 *   order before lexical names in sorted order.
 */
// [lyn, 12/24/12] Clean up of name prefixes; most work done earlier by paulmw
// [lyn, 11/29/12] Now handle params in control constructs
// [lyn, 11/18/12] Clarified structure of namespaces
// [lyn, 11/17/12]
// * Now handle event params.
// * Commented out loop params because AI doesn't handle loop variables correctly yet. 
// [lyn, 11/10/12]
// Returns the names of all names in lexical scope for the block associated with this menu. 
// including global variable names. 
// * Each global name is prefixed with "global " 
// * If Blockly.showPrefixToUser is false, non-global names are not prefixed. 
// * If Blockly.showPrefixToUser is true, non-global names are prefixed with labels
//   specified in blocklyeditor.js

Blockly.FieldLexicalVariable.prototype.getNamesInScope = function () {
  return Blockly.FieldLexicalVariable.getNamesInScope.call(this, this.block_);
}

/**
 * @param block
 * @returns {list} A list of all global and lexical names in scope at the given block.
 *   Global names are listed in sorted order before lexical names in sorted order.
 */
Blockly.FieldLexicalVariable.getNamesInScope = function (block) {

  var variables = Blockly.GlobalScope.getVariables().slice();

  if (block) {
	var allLexicalNames = block.getVariableScope().getVariablesInScope();
	if (allLexicalNames.length > 0) {
	  if (variables.length > 0) {
	    variables.push("separator");
	  }
	  variables = variables.concat(allLexicalNames);
	}
  }

  return variables;
}

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * @return {!Array.<string>} Array of variable names.
 * @this {!Blockly.FieldLexicalVariable}
 */
Blockly.FieldLexicalVariable.dropdownCreate = function() {
  return this.getNamesInScope();
};


/**
 * Create a dropdown menu under the text. This dropdown menu allows submenus
 * for selecting machine components, and disabled / enabled states for 
 * getters / setters.
 * @private
 */
Blockly.FieldLexicalVariable.prototype.showEditor_ = function() {
  Blockly.WidgetDiv.show(this, null);
  var thisField = this;
  var selected = this.value_;
  var forWrite = this.forSetter_;

  function callback(value) {
    if (thisField.changeHandler_) {
      // Call any change handler, and allow it to override.
      var override = thisField.changeHandler_(value);
      if (override !== undefined) {
        value = override;
      }
    }
    if (value !== null) {
      thisField.setValue(value);
    }
	Blockly.WidgetDiv.hideIfOwner(thisField);
  }

  // Build a menu or submenu
  function build (options, subMenu) {
    // If a submenu item is checked, all parent items will be checked.
	// This value is returned by build() to enable this.
	var menu = [];
	var checked = false;
	var option, menuItem;

	if (!subMenu && options.length === 0) {
	  menu.push({
		text: "No variables defined",
		enabled: false,
 	  });
	  options = [];
	}

    for (var x = 0; x < options.length; x++) {
      option = options[x];
	  
	  // Separators are allowed.
	  if (option === "separator") {
	    menuItem = { divider: true };
	  } 
	  
	  // Everything else will be a Blockly.Variable.
	  else if (option.getName) {
        menuItem = {
			text: option.getMenu(),  // Human-readable text.
			value: option, // Language-neutral value.
			enabled: !(forWrite && option.readonly)
		};
	    var attributes = option.getAttributes();

		// If a submenu is required
	    if (attributes.length) {
		  //menuItem.enabled = true;
	  	  menuItem.children = build(attributes, true);
		  var subChecked = menuItem.children.isChecked;

		  // Unless the parent menu item is disabled, add an entry 
		  // to allow the parent to be selected.
		  if (menuItem.enabled) {
		    var same = (option.getName() === selected);
		    menuItem.children = [{
				text: menuItem.text,
				value: menuItem.value,
				selected: same
			}, {
				divider: true
			}].concat(menuItem.children);
			
            subChecked |= same;
		  }

		  // If the parent item is "disabled" it should still be
		  // added to the menu to allow child items to be selected.
		  //if (menuItem.children.length > 0) {
		//	disabled = false;
		  //}

		  // If one of the child items is checked, the parent is checked.
		  if (subChecked) {
            menuItem.selected = true;
		  }
		  checked |= subChecked;
	    } 
		
		// Just a regular menu item.
		else {
		  var same = (option.getName() === selected);
          menuItem.selected = same;
		  checked |= same;
	    }
	  }

	  // "disabled" items are not added to the menu.
	  // goog.ui.SubMenu and goog.ui.Menu use different
	  // functions for adding children.
	  if (menuItem.enabled || menuItem.children) {
	    menu.push(menuItem);
	  }
    }

	menu.isChecked = checked;
	return menu;
  }

  var options = this.getOptions_();
  this.menu = new ContextMenu(build(options), callback, { selectable: true });

  var xy = Blockly.getAbsoluteXY_(/** @type {!Element} */ (this.borderRect_));
  var borderBBox = this.borderRect_.getBBox();
  this.menu.showForBox(xy, borderBBox);
};


/**
 * Split name into digit suffix and prefix before it. 
 * Return two-element list of prefix and suffix strings. Suffix is empty if no digits. 
 * @param {string} name Input string
 * @return {string list} Two-element list of prefix and suffix
 */
Blockly.FieldLexicalVariable.prefixSuffix = function(name) {
  var prefix = name;
  var suffix = "";
  var matchResult = name.match(/^(.*?)(\d+)$/);
  if (matchResult) 
    return [matchResult[1], matchResult[2]]; // List of prefix and suffix
  else 
    return [name, ""];
}

Blockly.LexicalVariable = {};

/**
 * [richard, 30/SEP/14]
 * Checks an identifier for validity. Validity rules are according to Python identifiers:
 *
 *   <identifier> = <first><rest>*
 *   <first> = letter U chars("_")
 *   <rest> = <first> U digit
 *
 * First transforms the name by removing leading and trailing whitespace and
 * converting nonempty sequences of internal whitespace to '_'.
 * Returns a result object of the form {transformed: <string>, isLegal: <bool>}, where:
 * result.transformed is the transformed name and result.isLegal is whether the transformed
 * named satisfies the above rules.
 */
Blockly.LexicalVariable.checkIdentifier = function(ident) {
  var transformed = ident.trim() // Remove leading and trailing whitespace
                         .replace(/[\s\xa0]+/g, '_'); // Replace nonempty sequences of internal spaces by underscores

  // Python 3 would allow Unicode characters:
  //var legalRegexp = /^[^-0-9!&%^/>=<`'"#:;\\\^\*\+\.\(\)\|\{\}\[\]\ \$\?~@][^-!&%^/>=<'"#:;\\\^\*\+\.\(\)\|\{\}\[\]\ \$\?~@]*$/
  // Python 2 does not.
  var legalRegexp = /^[a-zA-Z][a-zA-Z0-9_]*$/
  var isLegal = transformed.search(legalRegexp) == 0;
  return {isLegal: isLegal, transformed: transformed};
}

// [richard, 30/SEP/2014] Relax rules on variable naming.
Blockly.LexicalVariable.makeLegalIdentifier = function(ident) {
  if (ident === '') {
    return '_';
  } else {
    return ident;
  }
};

Blockly.LexicalVariable.sortAndRemoveDuplicates = function (strings) {
  var sorted = strings.sort();
  var nodups = []; 
  if (strings.length >= 1) {
    var prev = sorted[0];
    nodups.push(prev);
    for (var i = 1; i < sorted.length; i++) {
        if (! (sorted[i] === prev)) {
          prev = sorted[i];
          nodups.push(prev);
        }
    }
  }
  return nodups;
};

// [lyn, 11/23/12] Given a block, return the block connected to its next connection;
// If there is no next connection or no block, return null. 
Blockly.LexicalVariable.getNextTargetBlock = function (block) {
  if (block && block.nextConnection && block.nextConnection.targetBlock()) {
    return block.nextConnection.targetBlock();
  } else {
    return null;
  }
};

/**
 * [lyn, 11/16/13] Created
 * @param strings1: an array of strings
 * @param strings2: an array of strings
 * @returns true iff strings1 and strings2 have the same names in the same order; false otherwise
 */
Blockly.LexicalVariable.stringListsEqual = function (strings1, strings2) {
  var len1 = strings1.length;
  var len2 = strings2.length;
  if (len1 !== len2) {
    return false;
  } else {
    for (var i = 0; i < len1; i++) {
      if (strings1[i] !== strings2[i]) {
        return false;
      }
    }
  }
  return true; // get here iff lists are equal
};
