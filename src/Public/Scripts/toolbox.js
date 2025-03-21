const toolboxConfig = `
<xml xmlns="https://developers.google.com/blockly/xml" id="toolbox" style="display: none">
  <category name="Logic" categorystyle="logic_category" role="button" aria-label="Logic category" tabindex="0">
    <block type="controls_if"></block>
    <block type="logic_compare"></block>
    <block type="logic_operation"></block>
    <block type="logic_negate"></block>
    <block type="logic_boolean"></block>
    <block type="logic_ternary"></block>
  </category>
  <category name="Loops" categorystyle="loop_category" role="button" aria-label="Loops category" tabindex="0">
    <block type="controls_repeat_ext">
      <value name="TIMES">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
    </block>
    <block type="controls_repeat" disabled="true"></block>
    <block type="controls_whileUntil"></block>
    <block type="controls_for">
      <value name="FROM">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="TO">
        <shadow type="math_number">
          <field name="NUM">10</field>
        </shadow>
      </value>
      <value name="BY">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    <block type="controls_forEach"></block>
    <block type="controls_flow_statements"></block>
  </category>
  <category name="Math" categorystyle="math_category" role="button" aria-label="Math category" tabindex="0">
    <block type="math_number"></block>
    <block type="math_arithmetic">
      <value name="A">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
      <value name="B">
        <shadow type="math_number">
          <field name="NUM">1</field>
        </shadow>
      </value>
    </block>
    <block type="math_single">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">9</field>
        </shadow>
      </value>
    </block>
    <block type="math_round">
      <value name="NUM">
        <shadow type="math_number">
          <field name="NUM">3.1</field>
        </shadow>
      </value>
    </block>
    <block type="math_trig"></block>
    <block type="math_constant"></block>
    <block type="math_number_property"></block>
    <block type="math_on_list"></block>
    <block type="math_modulo"></block>
    <block type="math_constrain"></block>
    <block type="math_random_int"></block>
    <block type="math_random_float"></block>
  </category>
  <category name="Text" categorystyle="text_category" role="button" aria-label="Text category" tabindex="0">
    <block type="text"></block>
    <block type="text_join"></block>
    <block type="text_append">
      <value name="TEXT">
        <shadow type="text"></shadow>
      </value>
    </block>
    <block type="text_length">
      <value name="VALUE">
        <shadow type="text">
          <field name="TEXT">abc</field>
        </shadow>
      </value>
    </block>
    <block type="text_print">
        <value name="TEXT"><shadow type="text"><field name="TEXT">abc</field></shadow></value>
    </block>
    <block type="text_isEmpty"></block>
    <block type="text_indexOf"></block>
    <block type="text_charAt"></block>
    <block type="text_getSubstring"></block>
    <block type="text_changeCase"></block>
    <block type="text_trim"></block>
    <block type="text_prompt_ext"></block>
    <block type="text_count"></block>
    <block type="text_replace"></block>
    <block type="text_reverse"></block>
  </category>
  <category name="Lists" categorystyle="list_category" aria-label="List blocks">
      <block type="lists_create_with"><mutation items="0"></mutation></block>
      <block type="lists_create_with"></block>
      <block type="lists_repeat">
          <value name="NUM"><shadow type="math_number"><field name="NUM">5</field></shadow></value>
      </block>
      <block type="lists_length"></block>
      <block type="lists_isEmpty"></block>
      <block type="lists_indexOf">
          <value name="VALUE">
              <block type="variables_get">
                  <field name="VAR">list</field>
              </block>
          </value>
      </block>
      <block type="lists_getIndex">
          <value name="VALUE">
              <block type="variables_get">
                  <field name="VAR">list</field>
              </block>
          </value>
      </block>
      <block type="lists_setIndex">
          <value name="LIST">
              <block type="variables_get">
                  <field name="VAR">list</field>
              </block>
          </value>
      </block>
      <block type="lists_getSublist">
          <value name="LIST">
              <block type="variables_get">
                  <field name="VAR">list</field>
              </block>
          </value>
      </block>
      <block type="lists_split">
          <value name="DELIM">
              <shadow type="text">
                  <field name="TEXT">,</field>
              </shadow>
          </value>
      </block>
      <block type="lists_sort"></block>
      <block type="lists_reverse"></block>
  </category>
  <category name="Variables" categorystyle="variable_category" custom="VARIABLE" role="button" aria-label="Variables category" tabindex="0"></category>
  <category name="Functions" categorystyle="procedure_category" custom="PROCEDURE" role="button" aria-label="Functions category" tabindex="0"></category>
  <category name="Print" colour="160" role="button" aria-label="Print category" tabindex="0">
    <block type="custom_print"></block>
  </category>
</xml>
`;

// Make it available globally for Blockly
if (typeof window !== "undefined") {
  window.BLOCKLY_TOOLBOX = toolboxConfig;
}