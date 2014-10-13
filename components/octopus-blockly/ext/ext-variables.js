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
goog.provide('Blockly.VariableSubScope');
goog.provide('Blockly.GlobalScope');
//goog.provide('Blockly.Variables');

// TODO(scr): Fix circular dependencies
// goog.require('Blockly.Block');
goog.require('Blockly.Toolbox');
goog.require('Blockly.Workspace');

Blockly.Variable = function (name, scope, subScope) {
	this.name_ = "";
	this.display_ = null;
	this.scope_ = scope;
	this.subScope_ = subScope;
	this.type_ = "all";
	this.readonly = false;

	// local.subscope::myvar
	// local.subscope::myvar::subobj.subsubobj
	this.setName(name);
};

Blockly.Variable.variableRenamed_ = function (oldName, newName, variable) {
	var block, blocks = Blockly.mainWorkspace.getAllBlocks();
	for (var i = 0, max = blocks.length; i < max; i++) {
		block = blocks[i];
		if (block.renameVar) {
			block.renameVar(oldName, newName, variable);
		}
	}
};

Blockly.Variable.prototype.getScopeName_ = function () {
	return this.scope_.getName() + (this.subScope_ ? "." : "") + this.subScope_;
};

Blockly.Variable.prototype.getName = function () {
	return this.name_;
};

Blockly.Variable.prototype.setName = function (name) {
	var oldName = this.name_;
	var varName, attribute = this.attribute_, split;
	name = name.toLowerCase();     // TODO: Allow upper case in names, but do lower case comparisons.
	// TODO: make sure there are no "::" in name!!

	// Check that there is a namespace. This assumes that no-one will try
	// to set a name with attributes without also specifying the namespace.
	if (name.indexOf('::') < 0) {
		varName = name;
		split = [
			this.getScopeName_(),
			name
		]
		if (attribute) {
			split.push(attribute);
		}
		name = split.join('::');
	} else {
		split = name.split('::');
		varName = split[1];
		if (split.length === 3) {
			attribute = split[2];
		}
	}

	if (varName === "") {
		varName = "_";
	}

	if (name === this.name_) {
		return;
	}

	if (!this.scope_.isAvailableName(varName, attribute)) {
		varName = this.scope_.validName(varName, this.varName_);
		name = this.scope_.getScopeName_() + '::' + varName;
		if (attribute) {
			name += "::" + attribute;
		}
		split[1] = varName;
	}

	this.name_ = name;
	this.varName_ = varName;
	this.attribute_ = attribute;

	if (this.attributeScope_) {
		this.attributeScope_.setTopName(varName);
	}

	split.length = 3;
	this.split_ = split;

	Blockly.Variable.variableRenamed_(oldName, name, this);

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

Blockly.Variable.prototype.getVarAttribute = function () {
	return this.split_[2];
};

Blockly.Variable.prototype.setMenu = function (name) {
	this.menu_ = name;
};

Blockly.Variable.prototype.setDisplay = function (name) {
	this.display_ = name;
};

Blockly.Variable.prototype.setReadonly = function (readonly) {
	this.readonly = readonly;
};

Blockly.Variable.prototype.setType = function (type) {
	this.type_ = type;
};

Blockly.Variable.prototype.addAttribute = function (name) {
	if (!this.attributeScope_) {
		this.attributeScope_ = new Blockly.VariableSubScope(this.scope_);
	}
	name = this.name_ + (this.split_[2] ? '.' : '::') + name;
	var variable = this.attributeScope_.addVariable(name, this.subScope_);
	return variable;
};

Blockly.Variable.prototype.getAttribute = function (attributeName) {
	return this.attributeScope_ && this.attributeScope_.getVariable(attributeName);
};

Blockly.Variable.prototype.getAttributes = function () {
	return this.attributeScope_ ? this.attributeScope_.getVariables() : [];
};

Blockly.Variable.prototype.getNamespacedName = function () {
	return this.splitName_().slice(0, 2).join('::');
};

Blockly.Variable.prototype.getDisplay = function () {
	var split_ns = this.split_[0].split(".");
	var name = (this.scope_.global_ ? split_ns[1] + " " : "") + this.varName_;
	return (this.display_ ? name + this.display_ : name);
};

Blockly.Variable.prototype.getMenu = function () {
	var split_ns = this.split_[0].split(".");
	if (this.menu_) {
		return this.menu_;
	}
	return (this.scope_.global_ ? split_ns[1] + " " : "") + this.varName_;
};

Blockly.Variable.prototype.getScope = function () {
	return this.scope_;
};


Blockly.VariableScope = function (block) {
	if (block === "global") {
		this.global_ = true;
		this.block_ = null;
		this.namespace_ = 'global';
	} else {
		this.global_ = false;
		this.block_ = block;
		this.namespace_ = 'local';
	}

	this.variables_ = [];
};

Blockly.VariableScope.prototype.isGlobal = function () {
	return this.global_;
};

Blockly.VariableScope.prototype.getName = function () {
	return this.namespace_;
};

/**
 * Create a variable within this scope.
 * @param {string} name  Name for variable (optional). If no name is provided, one is generated.
 * @return {Blockly.Variable} New variable.
 */
Blockly.VariableScope.prototype.addVariable = function (name, subScope) {
	if (typeof name === "undefined" || name === "") {
		name = this.generateUniqueName();
	}
	var variable = new Blockly.Variable(name, this, subScope);
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
Blockly.VariableScope.prototype.getVariable = function (name, attribute) {
	var v = this.variables_;
	for (var i = 0; i < v.length; i++) {
		if (v[i].varName_ === name) {
			if (attribute) {
				return v[i].getAttribute(attribute);
			} else {
				return v[i];
			}
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
	var split = name.split('::');
	if (split.length > 1 && split[0].substr(0, 6) === "global") {
		return Blockly.GlobalScope.getVariable(split[1], split[2]);
	} else if (!this.block_) {
		return;
	} else {
		name = split[+(split.length > 1)];

		var attribute = split[2],
			variable = this.getVariable(name, attribute), 
			scope,
			block = this.block_.getSurroundParent();

		if (variable) {
			return variable;
		}

		while (block) {
			scope = block.getVariableScope(true);
			if (scope) {
				variable = this.getVariable(name, attribute);
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


Blockly.VariableSubScope = function (scope) {
	this.superScope_ = scope.superScope_ ? scope.superScope_ : scope;
	this.variables_ = [];
};
goog.inherits(Blockly.VariableSubScope, Blockly.VariableScope);
Blockly.VariableSubScope.prototype.isGlobal = function () {
	return this.superScope_.global_;
};
Blockly.VariableSubScope.prototype.getName = function () {
	return this.superScope_.getName();
};
Blockly.VariableSubScope.prototype.getVariable = function (attributeName) {
	// Hopefully this can be cleaned up a bit...
	if (typeof attributeName === "string") {
		attributeName = attributeName.split('.');
	}
	var firstName = attributeName.shift();
	var variable, variables = this.variables_;
	if (attributeName.length) {
		attributeName[0] = firstName + "." + attributeName[0];
	}
	for (var i = 0; i < variables.length; i++) {
		variable = variables[i];
		if (variable.attribute_ === firstName) {
			if (attributeName.length) {
				if (variable.attributeScope_) {
					return variable.attributeScope_.getVariable(attributeName);
				} else {
					return null;
				}
			} else {
				return variable;
			}
		}
	}
	return null;
};
Blockly.VariableSubScope.prototype.getNamesInScope = Blockly.VariableScope.prototype.getVariableNames;
Blockly.VariableSubScope.prototype.getScopedVariable = Blockly.VariableScope.prototype.getVariable;
Blockly.VariableSubScope.prototype.getVariablesInScope = Blockly.VariableScope.prototype.getVariables;
Blockly.VariableSubScope.prototype.getVariablesInChildScopes = function () {
	return [];
};
Blockly.VariableScope.prototype.isAvailableName = function (name, attribute) {
	return (this.getNamesInScope().indexOf(attribute) === -1);
};
Blockly.VariableScope.prototype.setTopName = function (name) {
	var v = this.variables_;
	for (var i = 0; i < v.length; i++) {
		v[i].setName(name);
	}
};

Blockly.GlobalScope = new Blockly.VariableScope("global", "global");

Blockly.GlobalScope.addVariable = function (name, type) {
	if (typeof type !== "string" || type === "") {
		type = "global";
	}
	return Blockly.VariableScope.prototype.addVariable.call(this, name, type);
};
