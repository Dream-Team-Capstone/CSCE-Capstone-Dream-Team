/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from '../node_modules/blockly/blocks';
import {forBlock} from './generators/python';  // Import the Python generator instead
import { pythonGenerator } from './generators/python.js';  // Use Blockly's Python generator
import {save, load} from '../src/serialization';
import {toolbox} from '../src/toolbox';
import '../src/Public/StylesPages/index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);  // Use the Python generator

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('output');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code and output divs, shows the
// generated code from the workspace, and displays the code.
// In this case, we are not using `eval` since it's not JavaScript.
const runCode = () => {
  const code = pythonGenerator.workspaceToCode(ws);  // Generate Python code
  console.log(code);
  codeDiv.innerText = code;

  // You would need to handle Python execution separately,
  // such as by sending it to a backend server or using a Python interpreter.
  // Example: send the code to a Python execution API
  // Example: execute the code via a Python interpreter in the browser (e.g., Pyodide or Brython)
};

// Load the initial state from storage and run the code.
load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});

// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()
  ) {
    return;
  }
  runCode();
});

// Switch for going from Block to Python and vice versa
document.getElementById('toggleSwitch').addEventListener('change', function() {
  const outputPane = document.getElementById('code-pane');
  const blocklyDiv = document.getElementById('output');
  
  if (this.checked) {
    outputPane.style.display = 'none';
    blocklyDiv.style.display = 'block';
  } else {
    outputPane.style.display = 'block';
    blocklyDiv.style.display = 'none';
  }
});