Blockly.PythonOcto['machine_vapourtec_R2R4'] = function(block) {
  var name = block.getFieldValue('NAME');
  var conn = Blockly.PythonOcto.valueToCode(block, 'CONNECTION',
      Blockly.PythonOcto.ORDER_NONE) || 'dummy()';
  return name + ' = vapourtec.R2R4(' + conn + ', alias = ' + Blockly.PythonOcto.quote_(name) + ')';
};
