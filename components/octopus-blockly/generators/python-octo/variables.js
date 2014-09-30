/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2012 Google Inc.
 * https://github.com/google/blockly
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
 * @fileoverview Generating Python-Octo for variable blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 * @author mail@richardingham.net (Richard Ingham)
 */
'use strict';

goog.provide('Blockly.PythonOcto.variables');

goog.require('Blockly.PythonOcto');


Blockly.PythonOcto.getVariableName_ = function(name){
  var pair = Blockly.unprefixName(name);
  var prefix = pair[0];
  var unprefixedName = pair[1];
  if (prefix === Blockly.globalNamePrefix) {
    name = unprefixedName;
  } else {
    (Blockly.possiblyPrefixYailNameWith(prefix))(unprefixedName);
  }
  return name;
};

Blockly.PythonOcto['variables_get'] = function(block) {
  // Variable getter.
  var name = Blockly.PythonOcto.getVariableName_(block.getFieldValue('VAR'));
  name = Blockly.PythonOcto.variableDB_.getName(name, Blockly.Variables.NAME_TYPE);
  return [name, Blockly.PythonOcto.ORDER_ATOMIC];
};

Blockly.PythonOcto['variables_set'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.PythonOcto.valueToCode(block, 'VALUE',
      Blockly.PythonOcto.ORDER_NONE) || '0';
  var name = Blockly.PythonOcto.getVariableName_(block.getFieldValue('VAR'));
  name = Blockly.PythonOcto.variableDB_.getName(name, Blockly.Variables.NAME_TYPE);
  return 'set(' + name + ', ' + argument0 + ')';
};

Blockly.PythonOcto['global_declaration'] = function(block) {
  // Variable setter.
  var argument0 = Blockly.PythonOcto.valueToCode(block, 'VALUE',
      Blockly.PythonOcto.ORDER_NONE) || '0';
  var varName = Blockly.PythonOcto.variableDB_.getName(block.getFieldValue('NAME'),
      Blockly.Variables.NAME_TYPE);
  return varName + ' = variable(' + argument0 + ')';
};
Blockly.PythonOcto['lexical_variable_set'] = Blockly.PythonOcto['variables_set'];
Blockly.PythonOcto['lexical_variable_get'] = Blockly.PythonOcto['variables_get'];
