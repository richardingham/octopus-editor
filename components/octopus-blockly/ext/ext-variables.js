/**
 * @license
 * Visual Blocks Editor
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
 * @fileoverview 
 * @author mail@richardingham.net (Richard Ingham)
 */
'use strict';

goog.provide('Blockly.Variable');
goog.provide('Blockly.VariableScope');
//goog.provide('Blockly.Variables');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Workspace');

Blockly.Variable = function (name, scope) {
	this.name_ = name;
	this.display_ = name;
	this.scope_ = scope;
	this.type_ = "all";
	this.attributes_ = [];
	this.blocks_ = [];
};

Blockly.Variable.prototype.getName = function () {
	return this.name_;
};

Blockly.Variable.prototype.getDisplay = function () {
	return this.display_;
};

Blockly.Variable.prototype.setDisplay = function (display) {
	this.display_ = display;
	this.name_ = display.toLowerCase();   /// FIRST CHECK FOR DUPLICATES
};

Blockly.Variable.prototype.getScope = function () {
	return this.scope_;
};

Blockly.Variable.prototype.rename = function () {
	// TODO
};



