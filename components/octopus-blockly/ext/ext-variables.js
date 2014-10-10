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
	this.name_ = "";
	this.scope_ = scope;
	this.type_ = "all";
	this.attributes_ = [];
	this.blocks_ = [];
	this.readonly = false;

	// local.block23::myvar
	// local.block23::myvar::subobj.subsubobj
	this.setName(name);
};

Blockly.Variable.prototype.getName = function () {
	return this.name_;
};

Blockly.Variable.prototype.setName = function (name) {
	var varName;
	name = name.toLowerCase();     // TODO: Allow upper case in names, but do lower case comparisons.

	// Check that there is a namespace. This assumes that no-one will try
	// to set a name with attributes without also specifying the namespace.
	if (name.indexOf('::') < 0) {
		varName = name;
		name = this.scope_.getName() + '::' + name;
	} else {
		varName = name.split('::')[1];
	}

	if (varName === "") {
		varName = "_";
	}

	if (name === this.name_) {
		return;
	}

	if (!this.scope_.isAvailableName(varName)) {
		varName = this.scope_.validName(varName, this.varName_);
		name = this.scope_.getName() + '::' + varName;
	}

	var split = name.split('::');
	split.length = 3;

	this.name_ = name;
	this.varName_ = varName;
	this.split_ = split;
	return name;
};

Blockly.Variable.prototype.splitName_ = function () {
	return this.split_;
};

Blockly.Variable.prototype.getNamespace = function () {
	return this.split_[0];
};

Blockly.Variable.prototype.getVarName = function () {
	return this.varName_;
};

Blockly.Variable.prototype.getAttribute = function () {
	return this.split_[2];
};

Blockly.Variable.prototype.getIdentifier = function () {
	var split_ns = this.split_[0].split(".");
	if (this.scope_.global_) {
		return split_ns[1] + "_" + this.varName_;
	}
	return this.varName_;
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


Blockly.VariableScope = function (block, namespace) {
	if (block === "global") {
		this.global_ = true;
		this.block_ = null;
		this.namespace_ = 'global.' + namespace;
	} else {
		this.global_ = false;
		this.block_ = block;
		this.namespace_ = 'local';
	}

	this.variables_ = [];
};

Blockly.VariableScope.prototype.getName = function () {
	return this.namespace_;
};

/**
 * Create a variable within this scope.
 * @param {string} name  Name for variable (optional). If no name is provided, one is generated.
 * @return {Blockly.Variable} New variable.
 */
Blockly.VariableScope.prototype.addVariable = function (name) {
	if (typeof name === "undefined" || name === "") {
		name = this.generateUniqueName();
	}
	var variable = new Blockly.Variable(name, this);
	this.variables_.push(variable);
	return variable;
};

/**
 * Delete a variable from this scope.
 * @param {string} name  Name of variable.
 * @return {Blockly.Variable}  New variable.
 */
Blockly.VariableScope.prototype.removeVariable = function (name) {
	var v = this.variables_;
	for (var i = 0; i < v.length; i++) {
		if (v[i].varName_ === name) {
			v.splice(i, 1);
			i--;
		}
	}
};

/**
 * Return variable defined in this scope with the desired name.
 * @return {Blockly.Variable | null} The variable.
 */
Blockly.VariableScope.prototype.getVariable = function (name) {
	var v = this.variables_;
	for (var i = 0; i < v.length; i++) {
		if (v[i].varName_ === name) {
			return v[i];
		}
	}
	return null;
};

/**
 * Return all variables defined in this scope.
 * @return {!Array.<Blockly.Variable>} Array of variables.
 */
Blockly.VariableScope.prototype.getVariables = function () {
	return this.variables_;
};

/**
 * Return all variables defined in this scope.
 * @return {!Array.<Blockly.Variable>} Array of variables.
 */
Blockly.VariableScope.prototype.getVariableNames = function () {
	return this.variables_.map(function (v) { return v.getVarName() });
};

/**
 * Return all variables defined in this scope.
 * @return {!Array.<Blockly.Variable>} Array of variables.
 */
Blockly.VariableScope.prototype.isAvailableName = function (name) {
	return (this.getNamesInScope().indexOf(name) === -1);
};

/**
 * Return all variables defined in this scope.
 * @return {!Array.<Blockly.Variable>} Array of variables.
 */
Blockly.VariableScope.prototype.getNamesInScope = function () {
	if (this.global_) {
		return Blockly.GlobalScope.getVariableNames();
	}
	return this.getVariablesInScope().concat(
		this.getVariablesInChildScopes()
	).map(function (v) { return v.getVarName() });
};

/**
 * Find a variable with the given name in the available scopes.
 * @return {Blockly.Variable} The variable.
 */
Blockly.VariableScope.prototype.getScopedVariable = function (name) {
	var split = name.split('::') 
	if (split.length > 1 && split[0].substr(0, 6) === "global") {
		return Blockly.GlobalScope.getVariable(split[1]);
	} else if (!this.block_) {
		return;
	} else {
		name = split[+(split.length > 1)];

		var variable = this.getVariable(name), 
			scope,
			block = this.block_.getSurroundParent();

		if (variable) {
			return variable;
		}

		while (block) {
			scope = block.getVariableScope(true);
			if (scope) {
				variable = this.getVariable(name);
				if (variable) {
					return variable;
				}
			}
			block = block.getSurroundParent();
		}
	}
};

Blockly.VariableScope.prototype.flattenScopedVariableArray_ = function (array) {
  var index = -1,
      length = array ? array.length : 0,
      result = [],
      seen = [],
      extra = 0;

  while (++index < length) {
    var value = array[index];

    var val, name, valIndex = -1,
        valLength = value.length,
        resIndex = result.length - extra;

    result.length += valLength;
    seen.length += valLength;
    while (++valIndex < valLength) {
      val = value[valIndex];
      name = val.getVarName();
      if (seen.indexOf(name) === -1) {
        result[resIndex] = val;
        seen[resIndex++] = name;
      } else {
        extra++;
      }
    }
  }

  result.length -= extra;
  return result;
}

/**
 * Return all variables that are in scope for blocks within this one.
 * @return {!Array.<Blockly.Variable>} The variables.
 */
Blockly.VariableScope.prototype.getVariablesInScope = function () {
  if (this.global_) {
    return [];
  }

  var scope, scopes = [],
      variables,
      block = this.block_;

  do {
    scope = block.getVariableScope(true);
    if (scope) {
      scopes.push(scope.getVariables());
    }
    block = block.getSurroundParent();
  } while (block);

  // Global vars are in a separate namespace.
  //if (Blockly.GlobalScope) {
  //  scopes.push(Blockly.GlobalScope.getVariables());
  //}

  variables = this.flattenScopedVariableArray_(scopes);

  return variables;
};

/**
 * Return all variables that defined in blocks within this one.
 * @return {!Array.<Blockly.Variable>} The variables.
 */
Blockly.VariableScope.prototype.getVariablesInChildScopes = function () {
  var blocks = [], variables = [];
  if (goog.isFunction(this.block_.blocksInScope)) {
    blocks = this.block_.blocksInScope();
  }

  var scope, block, scopeVars;

  for (var i = 0; i < blocks.length; i++) {
    block = blocks[i];
	if (block.childBlocks_.length) {
	  Array.prototype.push.apply(blocks, block.childBlocks_);
	}
	scope = block.getVariableScope(true);
    if (scope) {
	  scopeVars = scope.getVariables();
	  for (var j = 0; j < scopeVars.length; j++) {
		variables.push(scopeVars[i]);
	  }
	}
  }

  return variables;
};

/**
* Return a new variable name that is not yet being used in this scope. This will try to
* generate single letter variable names in the range 'i' to 'z' to start with.
* If no unique name is located it will try 'i1' to 'z1', then 'i2' to 'z2' etc.
* @return {string} New variable name.
*/
Blockly.VariableScope.prototype.generateUniqueName = function () {
  var variableList = this.getVariableNames();
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

/**
 * Possibly add a digit to name to distinguish it from names in list. 
 * Used to guarantee that two names aren't the same in situations that prohibit this. 
 * @param {string} name Proposed name.
 * @param {string} currentName If the variable is being renamed, current name.
 * @return {string} Non-colliding name.
 */
Blockly.VariableScope.prototype.validName = function (name, currentName) {
  // First find the nonempty digit suffixes of all names in nameList that have the same prefix as name
  // e.g. for name "foo3" and nameList = ["foo", "bar4", "foo17", "bar" "foo5"]
  // suffixes is ["17", "5"]
  var nameList = this.getVariableNames();
  var namePrefixSuffix = Blockly.FieldLexicalVariable.prefixSuffix(name);
  var namePrefix = namePrefixSuffix[0];
  var nameSuffix = namePrefixSuffix[1];
  var emptySuffixUsed = false; // Tracks whether "" is a suffix. 
  var isConflict = false; // Tracks whether nameSuffix is used 
  var suffixes = [];
  for (var i = 0; i < nameList.length; i++) {
    if (nameList[i] === currentName) {
      continue;
    }
    var prefixSuffix = Blockly.FieldLexicalVariable.prefixSuffix(nameList[i]);
    var prefix = prefixSuffix[0];
    var suffix = prefixSuffix[1];
    if (prefix === namePrefix) {
      if (suffix === nameSuffix) {
        isConflict = true;
      }
      if (suffix === "") {
        emptySuffixUsed = true;
      } else {
        suffixes.push(suffix); 
      }
    }
  } 
  if (! isConflict) {
    // There is no conflict; just return name
    return name; 
  } else if (! emptySuffixUsed) {
    // There is a conflict, but empty suffix not used, so use that
    return namePrefix;
  } else {
    // There is a possible conflict and empty suffix is not an option.
    // First sort the suffixes as numbers from low to high
    var suffixesAsNumbers = suffixes.map( function (elt, i, arr) { return parseInt(elt,10); } )
    suffixesAsNumbers.sort( function(a,b) { return a-b; } ); 
    // Now find smallest number >= 2 that is unused
    var smallest = 2; // Don't allow 0 or 1 an indices
    var index = 0; 
    while (index < suffixesAsNumbers.length) {
      if (smallest < suffixesAsNumbers[index]) {
        return namePrefix + smallest;
      } else if (smallest == suffixesAsNumbers[index]) {
        smallest++;
        index++;
      } else { // smallest is greater; move on to next one
        index++;
      }
    }
    // Only get here if exit loop
    return namePrefix + smallest;
  }
};

Blockly.GlobalScope = new Blockly.VariableScope("global", "global");

