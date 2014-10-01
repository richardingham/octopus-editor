/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Variable blocks for Blockly.
 * @author mail@richardingham.net (Richard Ingham)
 */
'use strict';

goog.provide('Blockly.Blocks.machines');

goog.require('Blockly.Blocks');


Blockly.Blocks['machine_vapourtec_R2R4'] = {
  init: function() {
    //this.setHelpUrl('http://www.example.com/');
    this.setColour(0);
    this.appendDummyInput()
        .appendField("Vapourtec R2+/R4 ")
        //.appendField(new Blockly.FieldVariable('reactor'), "NAME");
		
        .appendField(new Blockly.FieldMachineFlydown('reactor', //Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_NAME,
                                                    Blockly.FieldFlydown.DISPLAY_BELOW), 'NAME');
    this.appendValueInput("CONNECTION")
        .setCheck("machine-connection")
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField("connection");
    this.setTooltip('');
	this.setInputsInline(false);
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return [this.getFieldValue('NAME')];
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('NAME'))) {
      this.setFieldValue(newName, 'NAME');
    }
  },
  
  getVariablesMenu: function(name, forSetter) {
	return [
	  ["Pump A", [name, "pump1"], forSetter, [
	    ["Target", [name, "pump1", "target"]],
	    ["Flow Rate", [name, "pump1", "rate"], forSetter],
	    ["Pressure", [name, "pump1", "pressure"], forSetter]
	  ]],
	  ["Pump B", [name, "pump2"], forSetter, [
	    ["Target", [name, "pump2", "target"]],
	    ["Flow Rate", [name, "pump2", "rate"], forSetter],
	    ["Pressure", [name, "pump2", "pressure"], forSetter]
	  ]],
	];
  }
};
