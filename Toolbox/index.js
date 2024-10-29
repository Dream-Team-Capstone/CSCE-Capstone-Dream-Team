/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './node_modules/blockly/blocks';
import {pythonGenerator} from 'blockly/python';
import {save, load} from './serialization';
import {toolbox} from './node_modules/blockly/core/toolbox';
import './index.css';

// Register the blocks with Blockly
Blockly.common.defineBlocks(blocks);

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const blocklyDiv = document.getElementById('blocklyDiv');
const myWorkspace = Blockly.inject(blocklyDiv, {toolbox});

// This function resets the code div and shows the
// generated code from the workspace.
const runCode = () => {
  const code = pythonGenerator.workspaceToCode(myWorkspace);
  codeDiv.innerText = code;
};

// Load the initial state from storage and run the code.
load(myWorkspace);
runCode();

// Every time the workspace changes state, save the changes to storage.
myWorkspace.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(myWorkspace);
});

// Whenever the workspace changes meaningfully, run the code again.
myWorkspace.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (
    e.isUiEvent ||
    e.type == Blockly.Events.FINISHED_LOADING ||
    myWorkspace.isDragging()
  ) {
    return;
  }
  runCode();
});