/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from "blockly";
import { blocks } from "../node_modules/blockly/blocks";
import { pythonGenerator } from "../node_modules/blockly/python"; // Use Blockly's Python generator
import { save, load } from "./serialization";
import { toolbox } from "./toolbox";
import "./Public/StylesPages/index.css";
import Theme from "@blockly/theme-highcontrast";
import "./customBlocks.js";

// Define the start function here
function start() {
  // Initialize the Blockly workspace after the DOM is fully loaded
  const codeDiv = document.getElementById("generatedCode").firstChild;
  const outputDiv = document.getElementById("output");
  const blocklyDiv = document.getElementById("blocklyDiv");
  const ws = Blockly.inject(blocklyDiv, { toolbox, theme: Theme });

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
Blockly.common.defineBlocks(blocks, {
  custom_print: Blockly.Blocks["custom_print"],
});
Object.assign(pythonGenerator.forBlock, forBlock); // Use the Python generator
Object.assign(pythonGenerator);

// This function resets the code and output divs, shows the
// generated code from the workspace, and displays the code.
const runCode = () => {
  const code = pythonGenerator.workspaceToCode(ws); // Get Python code
  codeDiv.innerText = code;

  fetch("/api/run-python", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
  })
  .then(response => response.json())
  .then(data => {
      document.getElementById("terminal").innerText = data.output;
  })
  .catch(error => console.error("Error running Python code:", error));
};


// Switch for going from Block to Python and vice versa
document.getElementById("toggleSwitch").addEventListener("change", function () {
  const outputPane = document.getElementById("outputPane");
  const blocklyDiv = document.getElementById("blocklyDiv");

  if (this.checked) {
    outputPane.style.display = "none";
    blocklyDiv.style.display = "block";
  } else {
    outputPane.style.display = "block";
    blocklyDiv.style.display = "none";
  }
});

// Wait for DOM to be ready and then call start()
document.addEventListener("DOMContentLoaded", () => {
  start();
  window.start = start;
});
