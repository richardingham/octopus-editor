Blockly.Block.prototype.fill_ = Blockly.Block.prototype.fill;
Blockly.Block.prototype.fill = function(workspace, prototypeName) {
	Blockly.Block.prototype.fill_.call(this, workspace, prototypeName);

	if (!this.isInFlyout && this.workspace === Blockly.mainWorkspace) {
		console.log("Created Block " + this.id);
	}
};

Blockly.Block.prototype.dispose_ = Blockly.Block.prototype.dispose;
Blockly.Block.prototype.dispose = function() {
	if (!this.isInFlyout && this.workspace === Blockly.mainWorkspace) {
		console.log("Removed Block " + this.id);
	}

	Blockly.Block.prototype.dispose_.apply(this, arguments);
};

/*Blockly.Block.prototype.unplug_ = Blockly.Block.prototype.unplug;
Blockly.Block.prototype.unplug = function() {
	if (!this.isInFlyout && this.workspace === Blockly.mainWorkspace) {
		var parent = this.getParent();
		console.log("Unplugged Block " + this.id + (parent ? " from " + parent.id : ""));
	}

	Blockly.Block.prototype.unplug_.apply(this, arguments);
};*/
