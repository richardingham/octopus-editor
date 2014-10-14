
Blockly.Workspace.prototype.dispose_ = Blockly.Workspace.prototype.dispose;
Blockly.Workspace.prototype.dispose = function() {
  this.clear();
  this.dispose_();
  
  // Prevent any further change events trying to update deleted 
  // svg element or workspace. This is required to prevent errors.
  if (this.fireChangeEventPid_) {
    window.clearTimeout(this.fireChangeEventPid_);
  }
};
