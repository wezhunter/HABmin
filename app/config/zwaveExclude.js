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
        var messagesStore = Ext.create('Ext.data.Store', {
		    // explicitly create reader
		    model: 'ZWaveMessagesModel',
		    storeId: 'excludeMessagesStore',
            autoLoad: true,
		    proxy: {
			                    type: 'ajax',
			                    url: HABminBaseURL + '/zwave/status/ExclusionMessages/',
			                    reader: {
									type: 'json',
			                        root: 'records'
			                    },
			                    headers: {'Accept': 'application/json'},
           },
		});
		var excludeRunning = false;

Ext.define('openHAB.config.zwaveExclude', {
    extend: 'Ext.window.Window',
    closeAction: 'destroy',
    width: 750,
    height: 450,
    resizable: false,
    draggable: true,
    modal: true,
    flex: 1,
    itemId: 'zwaveExclude',
    layout: 'fit',
    initComponent: function () {
        this.title = language.zwave_ExcludeTitle;

        var me = this;

        var deviceTypeStore = Ext.create('Ext.data.Store', {
            fields: ['name'],
            data: [
                {name: 'any', label: 'Any Device'},
                {name: 'controller', label: 'Controller'},
                {name: 'slave', label: 'Slave'}
            ]
        });

        me.excludeForm = Ext.create('Ext.form.Panel', {
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
					id:'excludeStatusPanel',
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
					fieldLabel: 'Exclude Duration',
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
						        {header: 'Date',  dataIndex: 'description', width: 200},
						        {header: 'Message', dataIndex: 'value', flex:1, sortable: false},
						        {header: 'Node', dataIndex: 'minimum', sortable: false},
						        {header: 'State', dataIndex: 'state', sortable: false},
    					],
        				emptyText: 'No Messages'
				}),
            ]
        });

        this.items = [me.excludeForm];//, chanList];
        this.callParent();
    },
    updateMessagesData: {
	        run: function () {
				var store = Ext.StoreManager.lookup('excludeMessagesStore');
							if (store == null)
								return;
				if (excludeRunning) {
					store.reload();
				}
	        },
	        interval: 1000,
	        manualreload: function() {
				var store = Ext.StoreManager.lookup('excludeMessagesStore');
				if (store == null)
					return;
				store.reload();
			},
    },
    updateStatusBar: {
        run: function () {
			var store = Ext.StoreManager.lookup('excludeMessagesStore');
						if (store == null)
							return;
			var storeStatus = Ext.StoreManager.lookup('statusStore');

			var excludeButton = Ext.getCmp('btnBeginExclude');

			if (storeStatus != null) {
				var controllerIncluding = storeStatus.getById('InclusionStatus').get('value') == "true" ? true : false;
				var controllerExcluding = storeStatus.getById('ExclusionStatus').get('value') == "true" ? true : false;
				excludeRunning = controllerExcluding || controllerIncluding;
				if (excludeRunning)
					excludeButton.setDisabled(true);
				else
					excludeButton.setDisabled(false);

				if (controllerExcluding)
					Ext.getCmp('excludeStatusPanel').setIconCls('zwave-inclusion-running');
				else
					Ext.getCmp('excludeStatusPanel').setIconCls('zwave-inclusion-stopped');
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
            text: language.zwave_ExcludeClose,
            handler: function () {
                this.up('window').destroy();
            }
        },
        {
			id: 'btnBeginExclude',
            text: language.zwave_ExcludeBegin,
            disabled: true,
            handler: function () {
    		  var me = this.up('#zwaveExclude');
                if (me.excludeForm.isValid() == false) {
                    return;
                }
				var timerDuration = Ext.getCmp('includeTimerDuration').getValue() * 1000;
				var highpowerMode = Ext.getCmp('includePowerMode').getValue();

                Ext.Ajax.request({
                    url: HABminBaseURL + '/zwave/action/binding/network/' +  timerDuration + '/' + highpowerMode + '/',
                    method: 'PUT',
                    jsonData: 'Exclude',
                    headers: {'Accept': 'application/json'},
                    success: function (response, opts) {
						Ext.getCmp('btnBeginExclude').setDisabled(true);

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

