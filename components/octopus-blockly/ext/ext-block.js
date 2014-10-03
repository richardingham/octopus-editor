/**
 * Return the first parent block of a particular block type, 
 * or null if none is found.
 * @param {string} type New parent block.
 * @return {Blockly.Block} The ancestor block.
 */
Blockly.Block.prototype.getAncestor = function(type) {
  var block = this;
  do {
    block = block.getParent();
  } while (block && block.type !== type);
  return block || null;
};

/**
 * Return the first parent block of the desired type that surrounds the current 
 * block, or null if none is found. A parent block might just be the previous
 * statement, whereas the surrounding block is an if statement, while loop, etc.
 * @return {Blockly.Block} The block that surrounds the current block.
 */
Blockly.Block.prototype.getSurroundAncestor = function(type) {
  var block = this;
  do {
    var prevBlock = block;
    block = block.getAncestor(type);
    if (!block) {
      // Ran off the top.
      return null;
    }
  } while (block.getNextBlock() == prevBlock);
  // This block is an enclosing parent, not just a statement in a stack.
  return block;
};

/**
 * Return the variable scope of this block. i.e. the scope of the first
 * surrounding ancestor of this that has a scope, unless thisBlockOnly
 * is true, in which case null is returned if this block does not have 
 * a scope.
 * @param {boolean} thisBlockOnly Only consider this block.
 * @return {Blockly.VariableScope} The variable scope.
 */
Blockly.Block.prototype.getVariableScope = function(thisBlockOnly) {
  return this.variableScope || (thisBlockOnly ? 
    null : 
    this.getSurroundParent().getVariableScope()
  );
};

Blockly.Block.prototype.flattenScopedVariableArray_ = function (array) {
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
      if (seen.indexOf(name) >= 0) {
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
Blockly.Block.prototype.getVariablesInScope = function() {
  var scopes = [],
      variables,
      block = this,
      scope = this.getVariableScope(true);

  do {
    if (scope) {
      scopes.push(scope.getVariables());
    }
    block = block.getSurroundParent();
    scope = block.getVariableScope(true);
  } while (block);

  scopes.push(Blockly.Variables.getGlobalScope().getVariables());

  variables = this.flattenScopedVariableArray_(scopes);

  return variables;
};

Blockly.Block.prototype.fill_ = Blockly.Block.prototype.fill;
Blockly.Block.prototype.fill = function(workspace, prototypeName) {
	Blockly.Block.prototype.fill_.call(this, workspace, prototypeName);
	
	if (this.definesScope) {
		this.scope_ = Blockly.VariableScope(this);
	}
};
