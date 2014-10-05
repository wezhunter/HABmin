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


Ext.define('openHAB.config.zwaveDeviceList', {
    extend: 'Ext.panel.Panel',
    icon: 'images/application-list.png',
    title: language.zwave_Devices,
    border: false,
    layout: 'fit',

    initComponent: function () {
        var me = this;

        function getChildLeafNodes(node) {
            var allNodes = new Array();
            if (!Ext.value(node, false)) {
                return [];
            }

            if (!node.hasChildNodes()) {
                return [];
            } else if (node.isVisible()) {
                allNodes.push(node.get("domain"));
                node.eachChild(function (Mynode) {
                    allNodes = allNodes.concat(getChildLeafNodes(Mynode));
                });
            }
            return allNodes;
        }
        var includeRunning = false;
        var excludeRunning = false;
		var statusbar = Ext.create('Ext.ux.StatusBar', {
			id: 'zwave-devices-statusbar',
			height: 30,
			statusAlign: 'right',
            items: [
						{
							xtype: 'text',
							text: 'Status: ',
						},
						{
							id: 'controllerReady',
							xtype: 'button',
							text: 'Unknown',
							cls: 'x-btn-default-toolbar-small-over',
							overCls: 'x-btn-default-toolbar-small-over',
							pressedCls: 'x-btn-default-toolbar-small-over',
							cursor: 'default',
						},
						'-',
						{
							xtype: 'text',
							text: 'Controller: ',
						},
						{
							id: 'controllerConnected',
							xtype: 'button',
							text: 'Unknown',
							cls: 'x-btn-default-toolbar-small-over',
							overCls: 'x-btn-default-toolbar-small-over',
							pressedCls: 'x-btn-default-toolbar-small-over',
							cursor: 'default',
						},
						'-',
						{
							xtype: 'text',
							text: 'Transmit Queue: ',
						},
						{
							id: 'controllerSendQueue',
							xtype: 'button',
							text: '?',
							cls: 'x-btn-default-toolbar-small-over',
							overCls: 'x-btn-default-toolbar-small-over',
							pressedCls: 'x-btn-default-toolbar-small-over',
							cursor: 'default',
						},
						'-',
						{
							id: 'controllerInclusionStatus',
							xtype: 'button',
							hidden: true,
							disabled: false,
							cls: 'x-btn-default-toolbar-small-over',
							overCls: 'x-btn-default-toolbar-small-over',
						},

			       ]
        });
        Ext.define('ZWaveStatusModel', {
		            extend: 'Ext.data.Model',
		            idProperty: 'name',
		            fields: [
		                {name: 'name', type: 'string'},
		                {name: 'label', type: 'string'},
		                {name: 'optional', type: 'boolean'},
		                {name: 'readonly', type: 'boolean'},
		                {name: 'type', type: 'string'},
		                {name: 'value', type: 'string'},
		                {name: 'minimum', type: 'integer'},
		                {name: 'maximum', type: 'integer'},
		                {name: 'state', type: 'string'},
		                {name: 'description', type: 'string'},
		                {name: 'valuelist'},
		                {name: 'actionlist'}
		            ]
        });
        var statusStore = Ext.create('Ext.data.Store', {
		    // explicitly create reader
		    model: 'ZWaveStatusModel',
		    storeId: 'statusStore',
            autoLoad: true,
		    proxy: {
			                    type: 'ajax',
			                    url: HABminBaseURL + '/zwave/status/',
			                    reader: {
									type: 'json',
			                        root: 'records'
			                    },
			                    headers: {'Accept': 'application/json'},
           },

		});
        var toolbar = Ext.create('Ext.toolbar.Toolbar', {
            items: [
                {
                    icon: 'images/arrow-circle-315.png',
                    itemId: 'reload',
                    text: language.zwave_DevicesReloadButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesReloadButtonTip,
                    handler: function () {
                        var store = list.getStore();
                        if (store == null)
                            return;

                        // Reload the store
                        store.reload();
                    }
                },
                {
                    icon: 'images/bandaid--arrow.png',
                    itemId: 'heal-all',
                    text: language.zwave_DevicesHealButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesHealButtonTip,
                    handler: function () {
                        Ext.Ajax.request({
                            url: HABminBaseURL + '/zwave/action/binding/network/',
                            method: 'PUT',
                            jsonData: 'Heal',
                            headers: {'Accept': 'application/json'},
                            success: function (response, opts) {
                            },
                            failure: function () {
                                handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                            }
                        });
                    }
                },
                {
                    icon: 'images/wrench--plus.png',
                    itemId: 'include',
                    text: language.zwave_DevicesIncludeButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesIncludeButtonTip,
                    handler: function () {
                        Ext.create('openHAB.config.zwaveInclude').show();
                    }
                },
                {
                    icon: 'images/wrench--minus.png',
                    itemId: 'exclude',
                    text: language.zwave_DevicesExcludeButton,
                    cls: 'x-btn-icon',
                    disabled: false,
                    tooltip: language.zwave_DevicesExcludeButtonTip,
                    handler: function () {
                        Ext.create('openHAB.config.zwaveExclude').show();
                    }
                },
                '-',


            ]
        });

        // Create the model for the store
        Ext.define('ZWaveConfigModel', {
            extend: 'Ext.data.Model',
            idProperty: 'domain',
            fields: [
                {name: 'domain', type: 'string'},
                {name: 'name', type: 'string'},
                {name: 'label', type: 'string'},
                {name: 'optional', type: 'boolean'},
                {name: 'readonly', type: 'boolean'},
                {name: 'type', type: 'string'},
                {name: 'value', type: 'string'},
                {name: 'minimum', type: 'integer'},
                {name: 'maximum', type: 'integer'},
                {name: 'state', type: 'string'},
                {name: 'description', type: 'string'},
                {name: 'valuelist'},
                {name: 'actionlist'}
            ]
        });

        // Create the tree view, and the associated store
        var list = Ext.create('Ext.tree.Panel', {
            store: {
                extend: 'Ext.data.TreeStore',
                model: 'ZWaveConfigModel',
                autoSync: false,
                clearOnLoad: true,
                clearRemovedOnLoad: true,
                proxy: {
                    type: 'rest',
                    url: HABminBaseURL + '/zwave',
                    reader: {
                        root: 'records'
                    },
                    headers: {'Accept': 'application/json'},
                    pageParam: undefined,
                    startParam: undefined,
                    sortParam: undefined,
                    limitParam: undefined
                },
                nodeParam: "domain",
                root: {
                    text: 'nodes',
                    domain: 'nodes/',
                    expanded: true
                },
                listeners: {
                    load: function (tree, node, records, success) {
                        node.eachChild(function (childNode) {
                            var domain = childNode.get('domain');

                            // Set the icons and leaf attributes for the tree
                            if (domain.indexOf('/', domain.length - 1) == -1) {
                                childNode.set('leaf', true);

                                if (childNode.get('readonly') == true)
                                    childNode.set('iconCls', 'x-config-icon-readonly');
                                else
                                    childNode.set('iconCls', 'x-config-icon-editable');
                            }
                            else {
                                childNode.set('iconCls', 'x-config-icon-domain');
                                childNode.set('leaf', false);
                            }
                        });
                    }
                }
            },
            header: false,
            split: true,
            tbar: toolbar,
            bbar: statusbar,
            collapsible: false,
            multiSelect: false,
            singleExpand: true,
            rootVisible: false,
            viewConfig: {
                stripeRows: true,
                markDirty: false
            },
            plugins: [
                Ext.create('Ext.grid.plugin.CellEditing', {
                    clicksToEdit: 2,
                    listeners: {
                        beforeedit: function (e, editor) {
                            // Only allow editing if this is not a read-only cell
                            if (editor.record.get('readonly') == true)
                                return false;
                        },
                        edit: function (editor, e) {
                            // Detect if data has actually changed
                            if (e.originalValue == e.value) {
                                // No change!
                                return;
                            }

                            // Check that the value is within limits
                            var limitError = false;
                            if (limitError == true) {
                                handleStatusNotification(NOTIFICATION_WARNING,
                                    sprintf(language.zwave_DevicesValueUpdateRangeError, e.record.get('minimum'),
                                        e.record.get('maximum')));
                                return;
                            }

                            // All good - send it to the server
                            var domain = e.record.get('domain');
                            Ext.Ajax.request({
                                url: HABminBaseURL + '/zwave/set/' + domain,
                                method: 'PUT',
                                jsonData: e.value,
                                headers: {'Accept': 'application/json'},
                                success: function (response, opts) {
                                },
                                failure: function () {
                                    handleStatusNotification(NOTIFICATION_ERROR,
                                        language.zwave_DevicesValueUpdateError);
                                }
                            });
                        }
                    }
                })
            ],
            columns: [
                {
                    text: language.zwave_DevicesTreeNode,
                    xtype: 'treecolumn',
                    flex: 1,
                    dataIndex: 'label',
                    renderer: function (value, meta, record) {
                        // If a description is provided, then display this as a tooltip
                        var description = record.get("description");
                        if (description != "") {
                            description = Ext.String.htmlEncode(description);
                            meta.tdAttr = 'data-qtip="' + description + '"';
                        }

                        // Add a small status image to show the state of this record
                        var img = "";
                        switch (record.get('state')) {
                            case 'OK':
                                meta.tdCls = 'grid-ok';
                                break;
                            case 'WARNING':
                                meta.tdCls = 'grid-warning';
                                break;
                            case 'ERROR':
                                meta.tdCls = 'grid-error';
                                break;
                            case 'INITIALIZING':
                                meta.tdCls = 'grid-initializing';
                                break;
                        }

                        return value;
                    }
                },
                {
                    text: language.zwave_DevicesTreeValue,
                    flex: 1,
                    dataIndex: 'value',
                    renderer: function (value, meta, record) {
                        if (value == "")
                            return "";

                        // If the status is PENDING, then mark it so...
                        if (record.get('state') == "PENDING")
                            meta.style = 'background-color: #FDFD96;border-radius: 8px;';

                        // If this is a list, then we want to display the value, not the number!
                        var type = record.get('type');
                        if (type != "LIST")
                            return value;

                        var list = record.get('valuelist');
                        if (list == null || list.entry == null)
                            return value;

                        for (var cnt = 0; cnt < list.entry.length; cnt++) {
                            if (value == list.entry[cnt].key)
                                return list.entry[cnt].value;
                        }

                        // If we didn't find an entry with this value, just show the value.
                        return value;
                    },
                    getEditor: function (record, defaultField) {
                        var type = record.get('type');

                        if (type == "LIST") {
                            // This is a list, so we need to load the data into a store
                            // and create a combobox editor.
                            Ext.define('ListComboModel', {
                                extend: 'Ext.data.Model',
                                fields: [
                                    {name: 'key'},
                                    {name: 'value'}
                                ]
                            });
                            // Create the data store
                            var store = Ext.create('Ext.data.ArrayStore', {
                                model: 'ListComboModel'
                            });
                            var list = record.get('valuelist')
                            if (list != null && list.entry != null)
                                store.loadData(list.entry);

                            var editor = Ext.create('Ext.grid.CellEditor', {
                                field: Ext.create('Ext.form.field.ComboBox', {
                                    store: store,
                                    editable: false,
                                    displayField: 'value',
                                    valueField: 'key',
                                    queryMode: 'local'
                                })
                            });

                            editor.field.setEditable(false);
                            editor.field.setValue("YYY");
                            return editor;
                        } else {
                            return Ext.create('Ext.grid.CellEditor', {
                                field: Ext.create('Ext.form.field.Text')
                            });
                        }
                    }
                }
            ],
            listeners: {
                select: function (grid, record, index, eOpts) {
                    // Remove all current action buttons
                    for (var cnt = toolbar.items.length; cnt >= 5; cnt--) {
                        toolbar.remove(toolbar.items.get(cnt), true);
                    }

                    if (record == null)
                        return;

                    var list = record.get("actionlist");
                    if (list == null || list.entry == null)
                        return;

                    var actions = [].concat(list.entry);
                    if (actions.length == 0)
                        return;

                    var domain = record.get("domain");
                    var name = record.get("name");

                    // Add any actions for the selected item
                    for (var cnt = 0; cnt < actions.length; cnt++) {
                        var x = {
                            itemId: "action" + cnt,
                            icon: 'images/gear-small.png',
                            cls: 'x-btn-icon',
                            text: actions[cnt].value,
                            handler: function () {
                                var data = {};
                                var ref = this.itemId.substring(6);
                                data.action = actions[ref].key;
                                data.name = name;
                                Ext.Ajax.request({
                                    url: HABminBaseURL + '/zwave/action/' + domain,
                                    method: 'PUT',
                                    jsonData: actions[ref].key,
                                    headers: {'Accept': 'application/json'},
                                    success: function (response, opts) {
                                    },
                                    failure: function () {
                                        handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                                    }
                                });
                            }
                        };

                        toolbar.add(x);
                    }

                    // Get the node ID
 //                   var nodeName;
                },
                afteritemexpand: function (node, index, item, eOpts) {
                    // Get a list of all children nodes
                    me.nodePollingTable = getChildLeafNodes(node);

                    // And now add parents as well
                    var parent = node.parentNode;
                    while (parent != null) {
                        me.nodePollingTable.push(parent.get("domain"));
                        parent = parent.parentNode;
                    }
                }
            }
        });

        this.store = list.getStore();
        this.items = [list];
        this.callParent();
    },
    store: null,
    nodePollingTable: [],
    updateView: {
        run: function () {
            // Periodically update the visible store items
            if (this.nodePollingTable == null || this.nodePollingTable.length == 0)
                return;

            // Keep a local copy of 'this' so we have scope in the callback
            var me = this;
            // Loop through and request all visible nodes
            for (var cnt = 0; cnt < this.nodePollingTable.length; cnt++) {
                // Request an update of the node
                Ext.Ajax.request({
                    type: 'rest',
                    url: HABminBaseURL + '/zwave/' + this.nodePollingTable[cnt],
                    method: 'GET',
                    timeout: 3500,
                    success: function (response, opts) {
                        var res = Ext.decode(response.responseText);
                        if (res == null || res.records == null)
                            return;

                        // Loop through all records
                        for (var i = 0; i < res.records.length; i++) {
                            var updatedNode = me.store.getNodeById(res.records[i].domain);
                            if (updatedNode == null) {
                                // TODO:If the node isn't found, then it's new - add it!
//                                var rootNode = me.store.getRootNode();
//                                rootNode.insertChild(4,res.records[i]);
                                continue;
                            }

                            // Update the dynamic attributes
                            updatedNode.set("value", res.records[i].value);
                            updatedNode.set("state", res.records[i].state);
                        }
                    }
                });
            }
        },
        interval: 5000
    },
	updateStatusBarData: {
        run: function () {
			var store = Ext.StoreManager.lookup('statusStore');
						if (store == null)
							return;
			store.reload();
        },
        interval: 1000
    },
	updateStatusBar: {
        run: function () {
            // Periodically update the status bar
			var store = Ext.StoreManager.lookup('statusStore');
			if (store == null)
				return;

			var controllerStatus = store.getById('ControllerReady').get('value') == "true" ? true : false;
			var controllerConnected = store.getById('ControllerConnected').get('value') == "true" ? true : false;
			var controllerHealing = store.getById('NetworkHealRunning').get('value') == "true" ? true : false;
			var controllerSendQueue = store.getById('ControllerSendQueue').get('value');
			includeRunning = store.getById('InclusionStatus').get('value') == "true" ? true : false;
			excludeRunning = store.getById('ExclusionStatus').get('value') == "true" ? true : false;

			var statusBar_ControllerReady = Ext.getCmp('controllerReady');
			var statusBar_ControllerConnected = Ext.getCmp('controllerConnected');
			var statusBar_ControllerHealStatus = Ext.getCmp('controllerHealStatus');
			var statusBar_ControllerSendQueue = Ext.getCmp('controllerSendQueue');
			var statusBar_ControllerInclusionStatus = Ext.getCmp('controllerInclusionStatus');


			if (controllerStatus && !controllerHealing) {
				statusBar_ControllerReady.setText('Ready');
				statusBar_ControllerReady.setIconCls('zwave-status-ready');

			} else if (controllerHealing) {
				statusBar_ControllerReady.setText('Healing...');
				statusBar_ControllerReady.setIconCls('zwave-status-healing');
			} else {
				statusBar_ControllerReady.setText('Initializing...');
				statusBar_ControllerReady.setIconCls('zwave-status-init');
			}
			if (controllerConnected) {
				statusBar_ControllerConnected.setText('Connected');
				statusBar_ControllerConnected.setIconCls('zwave-status-ready');
			} else {
				statusBar_ControllerConnected.setText('Not Connected');
				statusBar_ControllerConnected.setIconCls('zwave-status-notready');
			}

			if (includeRunning) {
				statusBar_ControllerInclusionStatus.setText('Including...');
				statusBar_ControllerInclusionStatus.setIconCls('zwave-status-include');
				var btnHandlerFunction=function() {
				    Ext.create('openHAB.config.zwaveInclude').show()
    			};
				statusBar_ControllerInclusionStatus.setHandler(btnHandlerFunction);
				statusBar_ControllerInclusionStatus.show();
			} else if (excludeRunning) {
				statusBar_ControllerInclusionStatus.setText('Excluding...');
				statusBar_ControllerInclusionStatus.setIconCls('zwave-status-exclude');
				var btnHandlerFunction=function() {
					Ext.create('openHAB.config.zwaveExclude').show()
    			};
				statusBar_ControllerInclusionStatus.setHandler(btnHandlerFunction);
				statusBar_ControllerInclusionStatus.show();
			}
			else
			{
				statusBar_ControllerInclusionStatus.setHandler('');
				statusBar_ControllerInclusionStatus.hide();
			}

			// Send Queue...
			statusBar_ControllerSendQueue.setText(controllerSendQueue);
			if (controllerSendQueue < 10)
				statusBar_ControllerSendQueue.removeCls('zwave-status-red');
			else
				statusBar_ControllerSendQueue.addCls('zwave-status-red');
        },
        interval: 500
    },
    listeners: {
        beforeshow: function (grid, eOpts) {
            this.updateView.scope = this;
            Ext.TaskManager.start(this.updateView);
            this.updateStatusBarData.scope = this;
            Ext.TaskManager.start(this.updateStatusBarData);
            this.updateStatusBar.scope = this;
            Ext.TaskManager.start(this.updateStatusBar);
        },
        beforehide: function (grid, eOpts) {
            Ext.TaskManager.stop(this.updateView);
            Ext.TaskManager.stop(this.updateStatusBarData);
            Ext.TaskManager.stop(this.updateStatusBar);
        },
        beforedestroy: function (grid, eOpts) {
            Ext.TaskManager.stop(this.updateView);
            Ext.TaskManager.stop(this.updateStatusBar);
            Ext.TaskManager.stop(this.updateStatusBarData);
        }
    }
})
;
