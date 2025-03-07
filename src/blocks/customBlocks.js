import * as Blockly from "blockly";

// Define a new block
Blockly.Blocks["custom_print"] = {
  init: function () {
    this.appendValueInput("TEXT").setCheck("String").appendField("Print");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip("Prints text to the console");
    this.setHelpUrl("");
  },
};

// Define how the block translates to Python
import { pythonGenerator } from "blockly/python";

pythonGenerator.forBlock["custom_print"] = function (block) {
  var value_text = Blockly.Python.valueToCode(
    block,
    "TEXT",
    Blockly.Python.ORDER_ATOMIC
  );
  return `print(${value_text})\n`;
};
