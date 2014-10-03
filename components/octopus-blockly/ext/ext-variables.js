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
 * @author fraser@google.com (Neil Fraser)
 * @author mail@richardingham.net (Richard Ingham)
 */
'use strict';

goog.provide('Blockly.Variable');
goog.provide('Blockly.VariableScope');
goog.provide('Blockly.GlobalScope');
//goog.provide('Blockly.Variables');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Workspace');

Blockly.Variable = function (name, scope) {
	// local.block23::myvar
	// local.block23::myvar::subobj.subsubobj
	this.name_ = name;     

	this.scope_ = scope;
	this.type_ = "all";
	this.attributes_ = [];
	this.blocks_ = [];
};

Blockly.Variable.prototype.getName = function () {
	return this.name_;
};

Blockly.Variable.prototype.setName = function (name) {
	// Check that there is a namespace. This assumes that no-one will try
	// to set a name with attributes without also specifying the namespace.
	if (name.indexOf('::') < 0) {
		name = this.scope_.getName() + '::' + name;
	}

	name = name.toLowerCase();     /// CHECK FOR DUPLICATES, remove special chars, etc.

	this.name_ = name;  
	return name;
};

Blockly.Variable.prototype.splitName_ = function () {
	var split = this.name_.split('::');
	split.length = 3;
	return split;
};

Blockly.Variable.prototype.getNamespace = function () {
	return this.name_.split('::')[0];
};

Blockly.Variable.prototype.getVarName = function () {
	return this.splitName_()[1];
};

Blockly.Variable.prototype.getAttribute = function () {
	return this.splitName_()[2];
};

// This function should be overridden by anything that
// has attributes. Use getAttribute() to figure out which
// level of the var we are at????? (!!!!!!???????)
Blockly.Variable.prototype.getAttributes = function () {
	return [];
};

Blockly.Variable.prototype.getNamespacedName = function () {
	return this.splitName_().slice(0, 2).join('::');
};

Blockly.Variable.prototype.getDisplay = function () {
	return this.display_;  /// FORMAT
};

Blockly.Variable.prototype.getScope = function () {
	return this.scope_;
};

Blockly.Variable.prototype.rename = function () {
	// TODO
};


Blockly.VariableScope = function (block, namespace) {
	if (block === "global") {
		this.global_ = true;
		this.block_ = null;
		this.namespace_ = 'global.' + namespace;
	} else {
		this.global_ = false;
		this.block_ = block;
		this.namespace_ = 'local.block' + block.id;
	}

	this.variables_ = [];
};

Blockly.VariableScope.prototype.getName = function () {
	return this.namespace_;
};

/**
 * Create a variable within this scope.
 * @param {string} name (optional) name for variable. If no name is provided, one is generated.
 * @return {Blockly.Variable} new variable.
 */
Blockly.VariableScope.prototype.addVariable = function (name) {
	if (typeof name === "undefined" || name === "") {
		name = this.generateUniqueName();
	}
	var variable = new Blockly.Variable(name, this);
	this.variables.push(variable);
	return variable;
};

/**
 * Return all variables defined in this scope.
 * @return {!Array.<Blockly.Variable>} Array of variables.
 */
Blockly.VariableScope.prototype.getVariables = function () {
	return this.variables_;
};

/**
* Return a new variable name that is not yet being used in this scope. This will try to
* generate single letter variable names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
* @return {string} New variable name.
*/
Blockly.VariablesScope.prototype.generateUniqueName = function () {
  var variableList = this.getVariables().map(function (v) { return v.getVarName() });
  var newName = '';
  if (variableList.length) {
    variableList.sort(goog.string.caseInsensitiveCompare);
    var nameSuffix = 0, potName = 'i', i = 0, inUse = false;
    while (!newName) {
      i = 0;
      inUse = false;
      while (i < variableList.length && !inUse) {
        if (variableList[i].toLowerCase() == potName) {
          // This potential name is already used.
          inUse = true;
        }
        i++;
      }
      if (inUse) {
        // Try the next potential name.
        if (potName[0] === 'z') {
          // Reached the end of the character sequence so back to 'a' but with
          // a new suffix.
          nameSuffix++;
          potName = 'a';
        } else {
          potName = String.fromCharCode(potName.charCodeAt(0) + 1);
          if (potName[0] == 'l') {
            // Avoid using variable 'l' because of ambiguity with '1'.
            potName = String.fromCharCode(potName.charCodeAt(0) + 1);
          }
        }
        if (nameSuffix > 0) {
          potName += nameSuffix;
        }
      } else {
        // We can use the current potential name.
        newName = potName;
      }
    }
  } else {
    newName = 'i';
  }
  return newName;
};

Blockly.GlobalScope = Blockly.VariableScope("global", "global");

