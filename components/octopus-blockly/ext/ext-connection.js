
var _typeMap = [null, "Input", "Output", "Next", "Previous"];

Blockly.Connection.prototype.connect_ = Blockly.Connection.prototype.connect;
Blockly.Connection.prototype.connect = function(otherConnection) {
  Blockly.Connection.prototype.connect_.call(this, otherConnection);

  if (this.sourceBlock_.workspace === Blockly.mainWorkspace) {
    console.log("Connected " + this.sourceBlock_.id + ":" + _typeMap[this.type] + " to " + otherConnection.sourceBlock_.id + ":" + _typeMap[otherConnection.type]);
  }
};

Blockly.Connection.prototype.disconnect_ = Blockly.Connection.prototype.disconnect;
Blockly.Connection.prototype.disconnect = function() {
  var otherConnection = this.targetConnection;
  Blockly.Connection.prototype.disconnect_.call(this);

  if (this.sourceBlock_.workspace === Blockly.mainWorkspace) {
    console.log("Disconnected " + this.sourceBlock_.id + ":" + _typeMap[this.type] + " from " + otherConnection.sourceBlock_.id + ":" + _typeMap[otherConnection.type]);
  }
};
