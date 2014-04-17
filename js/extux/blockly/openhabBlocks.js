/**
 * HABmin - the openHAB admin interface
 *
 * openHAB, the open Home Automation Bus.
 * Copyright (C) 2010-2013, openHAB.org <admin@openhab.org>
 *
 * See the contributors.txt file in the distribution for a
 * full listing of individual contributors.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, see <http://www.gnu.org/licenses>.
 *
 * Additional permission under GNU GPL version 3 section 7
 *
 * If you modify this Program, or any covered work, by linking or
 * combining it with Eclipse (or a modified version of that library),
 * containing parts covered by the terms of the Eclipse Public License
 * (EPL), the licensors of this Program grant you additional permission
 * to convey the resulting work.
 */

/**
 * OpenHAB Admin Console HABmin
 *
 * @author Chris Jackson
 */
Blockly.Blocks['persistence_get'] = {
    init: function() {
        this.setHelpUrl('http://www.example.com/');
        this.setColour(290);
        this.appendValueInput("ITEM")
            .setCheck("String")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(new Blockly.FieldDropdown([["state", "STATE"], ["average", "AVERAGE"], ["minimum", "MINIMUM"], ["maximum", "MAXIMUM"]]), "TYPE")
            .appendField("of item");
        this.appendValueInput("DAYS")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("days");
        this.appendValueInput("HOURS")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("hours");
        this.appendValueInput("MINUTES")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("minutes");
        this.appendValueInput("SECONDS")
            .setCheck("Number")
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField("seconds");
        this.setOutput(true, ["Number", "String"]);
        this.setTooltip('');
    }
};

Blockly.Blocks['openhab_rule'] = {
    init: function () {
        this.setHelpUrl("HELP");
        this.setColour(45);
        this.appendDummyInput()
            .appendField(language.rule_DesignerRuleName)
            .appendField(new Blockly.FieldTextInput(name,
                Blockly.Procedures.rename), 'NAME')
            .appendField('', 'PARAMS');
        this.appendStatementInput('STACK')
            .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
        this.setTooltip(language.rule_DesignerRuleTooltip);
    }
};