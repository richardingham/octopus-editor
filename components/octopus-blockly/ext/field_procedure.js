// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2013-2014 MIT, All rights reserved
// Released under the MIT License https://raw.github.com/mit-cml/app-inventor/master/mitlicense.txt
/**
 * @license
 * @fileoverview Visual blocks editor for App Inventor
 * Methods to handle serialization of the blocks workspace
 *
 * @author sharon@google.com (Sharon Perl)
 * @author mail@richardingham.net (Richard Ingham)
 */

'use strict';


Blockly.FieldProcedure = {};
Blockly.AIProcedure = {};

Blockly.FieldProcedure.defaultValue = ["","none"]

Blockly.FieldProcedure.onChange = function(text) {
  var workspace = this.block.workspace;
  if(!this.block.editable_){ // [lyn, 10/14/13] .editable is undefined on blocks. Changed to .editable_
    workspace = Blockly.Drawer.flyout_.workspace_;
    return;
  }

  if(text == "" || text != this.getValue()) {
    for(var i=0;this.block.getInput('ARG' + i) != null;i++){
      this.block.removeInput('ARG' + i);
    }
    //return;
  }
  this.setValue(text);
  var def = Blockly.Procedures.getDefinition(text, workspace);
  if(def) {
    // [lyn, 10/27/13] Lyn sez: this causes complications (e.g., might open up mutator on collapsed procedure
    //   declaration block) and is no longer necessary with changes to setProedureParameters.
    // if(def.paramIds_ == null){
    //  def.mutator.setVisible(true);
    //  def.mutator.shouldHide = true;
    //}
    this.block.setProcedureParameters(def.arguments_, def.paramIds_, true); // It's OK if def.paramIds is null
  }
};

Blockly.AIProcedure.getProcedureNames = function(returnValue) {
  var topBlocks = Blockly.mainWorkspace.getTopBlocks();
  var procNameArray = [Blockly.FieldProcedure.defaultValue];
  for(var i=0;i<topBlocks.length;i++){
    var procName = topBlocks[i].getFieldValue('NAME')
    if(topBlocks[i].type == "procedures_defnoreturn" && !returnValue) {
      procNameArray.push([procName,procName]);
    } else if (topBlocks[i].type == "procedures_defreturn" && returnValue) {
      procNameArray.push([procName,procName]);
    }
  }
  if(procNameArray.length > 1 ){
    procNameArray.splice(0,1);
  }
  return procNameArray;
};

Blockly.AIProcedure.getNamedSequenceNames = function () {
  var topBlocks = Blockly.mainWorkspace.getTopBlocks();
  var procNameArray = [Blockly.FieldProcedure.defaultValue];
  for(var i=0;i<topBlocks.length;i++){
    var procName = topBlocks[i].getFieldValue('NAME')
    if (topBlocks[i].type == "procedures_namedsequence") {
      procNameArray.push([procName,procName]);
    }
  }
  if(procNameArray.length > 1 ){
    procNameArray.splice(0,1);
  }
  return procNameArray;
};

Blockly.AIProcedure.removeProcedureValues = function(name, workspace) {
  if (workspace  // [lyn, 04/13/14] ensure workspace isn't undefined
      && workspace === Blockly.mainWorkspace) {
    var blockArray = workspace.getAllBlocks();
    for(var i=0;i<blockArray.length;i++){
      var block = blockArray[i];
      if(block.type == "procedures_callreturn" || block.type == "procedures_callnoreturn") {
        if(block.getFieldValue('NAME') == name) {
          block.removeProcedureValue();
        }
      }
    }
  }
};
