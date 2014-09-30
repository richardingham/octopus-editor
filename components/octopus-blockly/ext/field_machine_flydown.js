// -*- mode: java; c-basic-offset: 2; -*-
/**
 * @license
 * @fileoverview Clickable field with flydown menu of machine getter blocks.
 * @author fturbak@wellesley.edu (Lyn Turbak)
 * @author mail@richardingham.net (Richard Ingham)
 */

'use strict';

goog.provide('Blockly.FieldMachineFlydown');

goog.require('Blockly.FieldFlydown');

/**
 * Class for a clickable global variable declaration field.
 * @param {string} text The initial parameter name in the field.
 * @extends {Blockly.Field}
 * @constructor
 */
Blockly.FieldMachineFlydown = function(name, displayLocation) {
  Blockly.FieldMachineFlydown.superClass_.constructor.call(this, name, true, displayLocation,
      // rename all references to this global variable
      Blockly.LexicalVariable.renameGlobal)
};
goog.inherits(Blockly.FieldMachineFlydown, Blockly.FieldFlydown);

Blockly.FieldMachineFlydown.prototype.fieldCSSClassName = 'blocklyFieldParameter';

Blockly.FieldMachineFlydown.prototype.flyoutCSSClassName = 'blocklyFieldParameterFlydown';

/**
 * Block creation menu for global variables
 * Returns a list of two XML elements: a getter block for name and a setter block for this parameter field.
 *  @return {!Array.<string>} List of two XML elements.
 **/
Blockly.FieldMachineFlydown.prototype.flydownBlocksXML_ = function() {
  var name = Blockly.machineNamePrefix + " " + this.getText(); // global name for this parameter field.
  var getterSetterXML =
      '<xml>' +
        '<block type="lexical_variable_get">' +
          '<title name="VAR">' +
            name +
          '</title>' +
        '</block>' +
      '</xml>';
  return getterSetterXML;
};


