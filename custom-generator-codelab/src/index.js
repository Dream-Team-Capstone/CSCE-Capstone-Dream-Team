import * as Blockly from 'blockly';
import { blocks } from './blocks/text';
import { forBlock } from './generators/python';
import { pythonGenerator } from 'blockly/python';
import { save, load } from './serialization';
import { toolbox } from './toolbox';
import './Public/StylesPages/HomeStyle.css';

// Register blocks and generators
Blockly.common.defineBlocks(blocks);
for (const [blockType, generator] of Object.entries(forBlock)) {
    pythonGenerator[blockType] = generator;
}

// Inject Blockly workspace
const blocklyDiv = document.getElementById('blocklyDiv');
const workspace = Blockly.inject(blocklyDiv, { toolbox });

// Load initial state from storage
load(workspace);

// Function to run code and generate output
function runCode() {
    try {
        console.log(pythonGenerator);  // Check if it's defined // DEBUG
        console.log(workspace);         // Check if workspace is initialized // DEBUG
        const code = pythonGenerator.workspaceToCode(workspace);
        document.getElementById('output').textContent = code || 'No code generated.';
    } catch (e) {
        document.getElementById('output').textContent = 'Error generating code: ' + e.message;
    }
}

// Run code once workspace is ready
workspace.addChangeListener((e) => {
    if (!e.isUiEvent) {
        save(workspace);
        runCode();
    }
});

// Toggle visibility of Blockly and output
document.getElementById('toggleSwitch').addEventListener('change', function () {
    const outputDiv = document.getElementById('output');
    const blocklyDiv = document.getElementById('blocklyDiv');

    if (this.checked) {
        outputDiv.style.display = 'none';
        blocklyDiv.style.display = 'block';
    } else {
        outputDiv.style.display = 'block';
        blocklyDiv.style.display = 'none';
    }
});

// Initial run
runCode();  
