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

Ext.define('ZWaveMessagesModel', {
		            extend: 'Ext.data.Model',
		            idProperty: 'name',
		            fields: [
		                {name: 'name', type: 'string'},
		                {name: 'date', type: 'date', dateFormat: 'c'},
		                {name: 'message', type: 'string'},
		                {name: 'messagetype', type: 'string'},
		                {name: 'messagevalue', type: 'integer'},
		                {name: 'nodeid', type: 'integer'},
		                {name: 'state', type: 'string'},
		            ]
        });
        var messagesStore = Ext.create('Ext.data.Store', {
		    // explicitly create reader
		    model: 'ZWaveMessagesModel',
		    storeId: 'includeMessagesStore',
            autoLoad: true,
		    proxy: {
			                    type: 'ajax',
			                    url: HABminBaseURL + '/zwave/status/InclusionMessages/',
			                    reader: {
									type: 'json',
			                        root: 'records'
			                    },
			                    headers: {'Accept': 'application/json'},
           },
		});
		var includeRunning = false;

Ext.define('openHAB.config.zwaveInclude', {
    extend: 'Ext.window.Window',
    closeAction: 'destroy',
    width: 750,
    height: 450,
    resizable: false,
    draggable: true,
    modal: true,
    flex: 1,
    itemId: 'zwaveInclude',
    layout: 'fit',
    initComponent: function () {
        this.title = language.zwave_IncludeTitle;

        var me = this;

        var deviceTypeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'any', label: 'Any Device'},
                {name: 'controller', label: 'Controller'},
                {name: 'slave', label: 'Slave'}
            ]
        });

        me.includeForm = Ext.create('Ext.form.Panel', {
            xtype: 'form',
            cls: 'save-chart-form',
            border: true,
            bodyPadding: '50 10 10 10',
            fieldDefaults: {
                labelAlign: 'left',
                labelWidth: 110,
                labelStyle: 'font-weight:bold',
                anchor: '100%'
            },
            items: [
				{
					xtype: 'button',
					id:'includeStatusPanel',
					height: 60,
					width: 60,
					text: ' ',
					cls: 'zwave-inclusion-btn',
					overCls: 'zwave-inclusion-btn',
					pressedCls: 'zwave-inclusion-btn',
					disabled: true,
				},

                {
                    xtype: 'checkboxfield',
                    name: 'power',
                    id: 'includePowerMode',
                    fieldLabel: language.zwave_IncludeHighPower
                },
                {
					xtype: 'sliderfield',
					name: 'timerDuration',
					id: 'includeTimerDuration',
					incrementValue: 10,
					minValue: 10,
					maxValue: 120,
					allowDecimals: false,
					value: 30,
					increment: 10,
					fieldLabel: 'Include Duration',
					tipText: function(thumb){
						                return String(thumb.value) + ' seconds';
           			},
                },
				Ext.create('Ext.grid.Panel', {
				        title: 'Messages',
				        id:'messagesGrid',
				        store: messagesStore,
				        height:200,
				        autoScroll: true,
				        multiSelect: false,
				        readOnly: true,
				        viewConfig: {
						    loadMask: false
						},
				        columns: [
						        {header: 'Date',  dataIndex: 'date', width: 200},
						        {header: 'Message', dataIndex: 'messagetype', flex:1, sortable: false},
						        {header: 'Node', dataIndex: 'nodeid', sortable: false},
						        {header: 'State', dataIndex: 'state', sortable: false},
    					],
        				emptyText: 'No Messages'
				}),
            ]
        });

        this.items = [me.includeForm];//, chanList];
        this.callParent();
    },
    updateMessagesData: {
	        run: function () {
				var store = Ext.StoreManager.lookup('includeMessagesStore');
							if (store == null)
								return;
				if (includeRunning) {
					store.reload();
				}
	        },
	        interval: 1000,
	        manualreload: function() {
				var store = Ext.StoreManager.lookup('includeMessagesStore');
				if (store == null)
					return;
				store.reload();
			},
    },
    updateStatusBar: {
        run: function () {
			var store = Ext.StoreManager.lookup('includeMessagesStore');
						if (store == null)
							return;
			var storeStatus = Ext.StoreManager.lookup('statusStore');

			var includeButton = Ext.getCmp('btnBeginInclude');

			if (storeStatus != null) {
				var controllerIncluding = storeStatus.getById('InclusionStatus').get('value') == "true" ? true : false;
				var controllerExcluding = storeStatus.getById('ExclusionStatus').get('value') == "true" ? true : false;
				includeRunning = controllerExcluding || controllerIncluding;
				if (includeRunning)
					includeButton.setDisabled(true);
				else
					includeButton.setDisabled(false);

				if (controllerIncluding)
					Ext.getCmp('includeStatusPanel').setIconCls('zwave-inclusion-running');
				else
					Ext.getCmp('includeStatusPanel').setIconCls('zwave-inclusion-stopped');
			}


        },
        interval: 1000
    },
    listeners: {
	        beforeshow: function (grid, eOpts) {
				this.updateMessagesData.manualreload();
				this.updateStatusBar.run();
	            this.updateMessagesData.scope = this;
	            Ext.TaskManager.start(this.updateMessagesData);
	            this.updateStatusBar.scope = this;
	            Ext.TaskManager.start(this.updateStatusBar);
	        },
	        beforehide: function (grid, eOpts) {
	            Ext.TaskManager.stop(this.updateMessagesData);
	            Ext.TaskManager.stop(this.updateStatusBar);
	        },
	        beforedestroy: function (grid, eOpts) {
	            Ext.TaskManager.stop(this.updateMessagesData);
	            Ext.TaskManager.stop(this.updateStatusBar);
	        }
    },

    buttons: [
        {
            text: language.zwave_IncludeClose,
            handler: function () {
                this.up('window').destroy();
            }
        },
        {
			id: 'btnBeginInclude',
            text: language.zwave_IncludeBegin,
            disabled: true,
            handler: function () {
    		  var me = this.up('#zwaveInclude');
                if (me.includeForm.isValid() == false) {
                    return;
                }
				var timerDuration = Ext.getCmp('includeTimerDuration').getValue() * 1000;
				var highpowerMode = Ext.getCmp('includePowerMode').getValue();
                Ext.Ajax.request({
                    url: HABminBaseURL + '/zwave/action/binding/network/' +  timerDuration + '/' + highpowerMode + '/',
                    method: 'PUT',
                    jsonData: 'Include',
                    headers: {'Accept': 'application/json'},
                    success: function (response, opts) {
						Ext.getCmp('btnBeginInclude').setDisabled(true);

                    },
                    failure: function () {
                        handleStatusNotification(NOTIFICATION_ERROR, language.zwave_DevicesActionError);
                    }
                });
            }
        }
    ]
})
;

