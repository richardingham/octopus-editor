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
  if (thisBlockOnly) {
    return this.variableScope_ || null;
  }

  var parent = this.getSurroundParent();
  return this.variableScope_ || (parent && parent.getVariableScope()) || Blockly.GlobalScope;
};

Blockly.Block.prototype.fill_ = Blockly.Block.prototype.fill;
Blockly.Block.prototype.fill = function(workspace, prototypeName) {
	Blockly.Block.prototype.fill_.call(this, workspace, prototypeName);

	if (this.definesScope) {
		this.variableScope_ = new Blockly.VariableScope(this);
	}

	if (goog.isFunction(this.created)) {
		this.created();
	}
};

Blockly.Block.prototype.dispose_ = Blockly.Block.prototype.dispose;
Blockly.Block.prototype.dispose = function() {
	Blockly.Block.prototype.dispose_.apply(this, arguments);

	if (goog.isFunction(this.disposed)) {
		this.disposed();
	}
};
