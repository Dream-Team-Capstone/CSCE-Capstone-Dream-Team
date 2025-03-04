/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from '../node_modules/blockly';
import {blocks} from '../node_modules/blockly/blocks';
import {pythonGenerator} from '../node_modules/blockly/python';  // Use Blockly's Python generator
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import Theme from '../node_modules/@blockly/theme-highcontrast'; // Import high contrast theme
import DarkTheme from '../node_modules/@blockly/theme-dark';
import './Public/StylesPages/index.css';

let ws; // Making ws a global variable

// Define the start function here
function start() {
  // Initialize the Blockly workspace after the DOM is fully loaded
  const codeDiv = document.getElementById('generatedCode').firstChild;
  const outputDiv = document.getElementById('output');
  const blocklyDiv = document.getElementById('blocklyDiv');
  ws = Blockly.inject(blocklyDiv, {
    toolbox,
    theme: Blockly.Themes.Classic, //setting the page to Classic
  });

  // Run the initial setup of the page (like loading and running code)
  load(ws);
  runCode();

  // Add event listeners to handle changes in the workspace
  ws.addChangeListener((e) => {
    if (e.isUiEvent) return;
    save(ws);
  });

  ws.addChangeListener((e) => {
    if (
      e.isUiEvent ||
      e.type == Blockly.Events.FINISHED_LOADING ||
      ws.isDragging()
    ) {
      return;
    }
    runCode();
  });
}

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(pythonGenerator.forBlock, forBlock);  // Use the Python generator
Object.assign(pythonGenerator);

// This function resets the code and output divs, shows the
// generated code from the workspace, and displays the code.
const runCode = () => {
  const code = pythonGenerator.workspaceToCode(ws);  // Generate Python code
  codeDiv.innerText = code;
  // You would need to handle Python execution separately
};

// Switch for going from Block to Python and vice versa
document.getElementById('toggleSwitch').addEventListener('change', function() {
  const outputPane = document.getElementById('outputPane');
  const blocklyDiv = document.getElementById('blocklyDiv');
  
  if (this.checked) {
    outputPane.style.display = 'none';
    blocklyDiv.style.display = 'block';
  } else {
    outputPane.style.display = 'block';
    blocklyDiv.style.display = 'none';
  }
});

// Function to change Blockly themes dynamically
function setTheme(theme) {
  document.body.classList.toggle('high-contrast', theme === Theme);
  document.body.classList.toggle('dark-mode', theme === DarkTheme);

  ws.dispose();
  ws = Blockly.inject('blocklyDiv', {
    toolbox,
    theme: theme,
  });

  load(ws);
  runCode();
}

// Theme toggling for Dark Mode and High Contrast Mode
document.getElementById('highContrastToggle').addEventListener('change', function () {
  if (this.checked) {
    document.getElementById('darkModeToggle').checked = false;
    setTheme(Theme);
  } else {
    setTheme(Blockly.Themes.Classic);
  }
});

document.getElementById('darkModeToggle').addEventListener('change', function () {
  if (this.checked) {
    document.getElementById('highContrastToggle').checked = false;
    setTheme(DarkTheme);
  } else {
    setTheme(Blockly.Themes.Classic);
  }
});

// Wait for DOM to be ready and then call start()
document.addEventListener('DOMContentLoaded', () => {
  start();
  window.start = start;
});