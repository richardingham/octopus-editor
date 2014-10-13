/**
 * Prototype bindings for a global variable declaration block
 */
Blockly.Blocks['global_declaration'] = {
  // Global var defn
  //category: 'Variables',
  //helpUrl: Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_HELPURL,
  init: function() {
    this.setColour(330);
    this.appendValueInput('VALUE')
        .appendField('initialise global') //Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_TITLE_INIT)
        .appendField(
          new Blockly.FieldGlobalFlydown( 
            'name', //Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_NAME,
            Blockly.FieldFlydown.DISPLAY_BELOW,
            this.rename_.bind(this)
          ), 'NAME')
        .appendField('to'); //Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_TO);
    this.setTooltip('Declare a global variable'); //Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_TOOLTIP);

	if (!this.isInFlyout) {
		this.rename_('name');
		this.getField_('NAME').setValue(this.variable_.getVarName());
	}
  },
  getVars: function() {
    return [this.getFieldValue('NAME')];
  },
  // No external rename allowed??
  /*renameVar: function(oldName, newName, variable) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('NAME'))) {
      this.getFieldValue(newName, 'NAME');
    }
  },*/
  rename_: function (newName) {
    var oldName = this.getFieldValue('NAME');
	if (oldName === newName && this.variable_) {
	  return newName;
	}
	if (!this.variable_) {
	  this.variable_ = Blockly.GlobalScope.addVariable(newName);
	} else {
	  this.variable_.setName(newName);
	} 
	return this.variable_.getVarName();
  }
  //typeblock: [{ translatedName: Blockly.Msg.LANG_VARIABLES_GLOBAL_DECLARATION_TITLE_INIT }]
};

/**
 * Prototype bindings for a variable getter block
 */
Blockly.Blocks['lexical_variable_get'] = {
  // Variable getter.
  //category: 'Variables',
  //helpUrl: Blockly.Msg.LANG_VARIABLES_GET_HELPURL,
  init: function() {
    this.setColour(330);
    this.fieldVar_ = new Blockly.FieldLexicalVariable(" ");
    this.fieldVar_.setBlock(this);
    this.appendDummyInput()
        .appendField('get') //Blockly.Msg.LANG_VARIABLES_GET_TITLE_GET)
        .appendField(this.fieldVar_, 'VAR');
    this.setOutput(true, null);
    this.setTooltip(''); //Blockly.Msg.LANG_VARIABLES_GET_TOOLTIP);
    //this.errors = [{name:"checkIsInDefinition"},{name:"checkDropDownContainsValidValue",dropDowns:["VAR"]}];
  },
  //mutationToDom: function() { // Handle getters for event parameters specially (to support i8n)
  //  return Blockly.LexicalVariable.eventParamMutationToDom(this);
  //},
  //domToMutation: function(xmlElement) { // Handler getters for event parameters specially (to support i8n)
  //  Blockly.LexicalVariable.eventParamDomToMutation(this, xmlElement);
  //},
  getVariable: function () {
	var scope = this.getVariableScope();
	return scope && scope.getScopedVariable(this.getField_('VAR').getFullVariableName());
  },
  renameVar: function(oldName, newName, variable) {
    if (Blockly.Names.equals(oldName, this.getField_('VAR').getFullVariableName())) {
      this.getField_('VAR').setValue(variable);
    }
  },
  getVars: function() {
    return [this.getField_('VAR').getFullVariableName()];
  },/*
  renameLexicalVar: function(oldName, newName) {
    // console.log("Renaming lexical variable from " + oldName + " to " + newName);
    var currentValue = this.getFieldValue('VAR');
	if (oldName === currentValue) {
      this.setFieldValue(newName, 'VAR');
    } else if (Array.isArray(currentValue)) {
	  // TODO: potential bug if variables other than machines are allowed to have sub-items.
	  // This would require rewriting how variable references are stored.
	  if (currentValue[0] == Blockly.unprefixName(oldName)[1]) {
		currentValue[0] = Blockly.unprefixName(newName)[1];
        this.setFieldValue(currentValue, 'VAR');
	  }
	}
  },
  renameFree: function (freeSubstitution) {
    var prefixPair = Blockly.unprefixName(this.getFieldValue('VAR'));
    var prefix = prefixPair[0];
    // Only rename lexical (nonglobal) names
    if (prefix !== Blockly.globalNamePrefix) {
      var oldName = prefixPair[1];
      var newName = freeSubstitution.apply(oldName);
      if (newName !== oldName) {
        this.renameLexicalVar(oldName, newName);
      }
    }
  },
  freeVariables: function() { // return the free lexical variables of this block
    var prefixPair = Blockly.unprefixName(this.getFieldValue('VAR'));
    var prefix = prefixPair[0];
    // Only return lexical (nonglobal) names
    if (prefix !== Blockly.globalNamePrefix) {
      var oldName = prefixPair[1];
      return new Blockly.NameSet([oldName])
    } else {
      return new Blockly.NameSet();
    }
  },*/
  //typeblock: [{ translatedName: Blockly.Msg.LANG_VARIABLES_GET_TITLE_GET + Blockly.Msg.LANG_VARIABLES_VARIABLE }]
};

/**
 * Prototype bindings for a variable setter block
 */
Blockly.Blocks['lexical_variable_set'] = {
  // Variable setter.
  //category: 'Variables',
  //helpUrl: Blockly.Msg.LANG_VARIABLES_SET_HELPURL, // *** [lyn, 11/10/12] Fix this
  init: function() {
    this.setColour(330); //Blockly.VARIABLE_CATEGORY_HUE);
    this.fieldVar_ = new Blockly.FieldLexicalVariable(" ", true);
    this.fieldVar_.setBlock(this);
    this.appendValueInput('VALUE')
        .appendField('set') //Blockly.Msg.LANG_VARIABLES_SET_TITLE_SET)
        .appendField(this.fieldVar_, 'VAR')
        .appendField('to') //Blockly.Msg.LANG_VARIABLES_SET_TITLE_TO);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(''); //Blockly.Msg.LANG_VARIABLES_SET_TOOLTIP);
    //this.errors = [{name:"checkIsInDefinition"},{name:"checkDropDownContainsValidValue",dropDowns:["VAR"]}];
  },
  //mutationToDom: function() { // Handle setters for event parameters specially (to support i8n)
  //  return Blockly.LexicalVariable.eventParamMutationToDom(this);
  //},
  //domToMutation: function(xmlElement) { // Handler setters for event parameters specially (to support i8n)
 //   Blockly.LexicalVariable.eventParamDomToMutation(this, xmlElement);
  //},
  getVariable: function () {
	var scope = this.getVariableScope();
	return scope && scope.getScopedVariable(this.getField_('VAR').getFullVariableName());
  },
  renameVar: function(oldName, newName, variable) {
    if (Blockly.Names.equals(oldName, this.getField_('VAR').getFullVariableName())) {
      this.getField_('VAR').setValue(variable);
    }
  },
  getVars: function() {
    return [this.getField_('VAR').getFullVariableName()];
  },
  /*renameLexicalVar: Blockly.Blocks.lexical_variable_get.renameLexicalVar,
  renameFree: function (freeSubstitution) {
    Blockly.Blocks.lexical_variable_get.renameFree.call(this, freeSubstitution);

    // [lyn, 06/26/2014] Don't forget to rename children!
    this.getChildren().map( function(blk) { Blockly.LexicalVariable.renameFree(blk, freeSubstitution); })
  },
  freeVariables: function() { // return the free lexical variables of this block
    // [lyn, 06/27/2014] Find free vars of *all* children, including subsequent commands in NEXT slot.
    var childrenFreeVars = this.getChildren().map( function(blk) { return Blockly.LexicalVariable.freeVariables(blk); } );
    var result = Blockly.NameSet.unionAll(childrenFreeVars);
    var prefixPair = Blockly.unprefixName(this.getFieldValue('VAR'));
    var prefix = prefixPair[0];
    // Only return lexical (nonglobal) names
    if (prefix !== Blockly.globalNamePrefix) {
      var oldName = prefixPair[1];
      result.insert(oldName);
    }
    return result;
  },*/
  //typeblock: [{ translatedName: Blockly.Msg.LANG_VARIABLES_SET_TITLE_SET + Blockly.Msg.LANG_VARIABLES_VARIABLE }]
};
