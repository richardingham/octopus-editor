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

