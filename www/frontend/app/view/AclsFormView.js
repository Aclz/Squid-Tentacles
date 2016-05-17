Ext.define('tentacles.view.AclsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.aclsformview',
    
    requires: [
        'tentacles.view.AclsFormViewController'
        ],
    
    bodyPadding: 10,

    viewModel: {
        data: {
            gridSelectionEmpty: true
            },
            
        links: {
            settings: {
                reference: 'SettingsModel',
                create: true
                }
            },
            
        stores: {
            aclStore: {
                model: 'AclModel',

                pageSize: 0,

                autoLoad: false,

                listeners: {                    
                    datachanged: 'onAclStoreDataChanged',
                    load: 'onAclStoreLoad'
                    }
                }
            },
            
        formulas: {
            settingsRecordStatus: {
                bind: {
                    bindTo: '{settings}',
                    deep: true
                    },

                get: function(settings) {
                    var result = {
                        dirty: settings ? settings.dirty : false,
                        valid: settings ? settings.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                },

            settingsRecordAndStoreStatus: function(get) {
                var result = {
                    dirty: get('settingsRecordStatus').dirty || get('storeIsDirty'),
                    valid: get('settingsRecordStatus').valid
                    };

                result.dirtyAndValid = result.dirty && result.valid;

                return result;
                },
                
            hideEditableControls: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'EditSettings') == -1;
                }
            }
        },
        
    controller: 'aclsformviewcontroller',
        
    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
        },
    
    items: [
        {
        xtype: 'container',
        layout: 'auto',
        margin: '0 5 5 0',
        
        items: [
            {
            xtype: 'displayfield',
            width: 415,
            labelWidth: 205,
            fieldLabel: 'Список доступа по-умолчанию',
            hidden: false,

            bind: {
                value: '{defaultaclcombobox.selection.name}',
                hidden: '{!hideEditableControls}'
                },
            
            listeners: {
                afterrender: function(me) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: me.getId(),
                        showDelay: 750,
                        dismissDelay: 10000,
                        title: me.fieldLabel,
                        html: 'Список доступа, автоматически присваеваемый новым пользователям.'
                        });
                    }
                }
            },
            {
            xtype: 'combobox',
            reference: 'defaultaclcombobox',
            width: 415,
            labelWidth: 205,
            fieldLabel: 'Список доступа по-умолчанию',
            editable: false,
            hidden: true,
            displayField: 'name',
            valueField: 'id',
            autoLoadOnValue: true,

            bind: {
                value: '{settings.defaultAclId}',
                hidden: '{hideEditableControls}',
                store: '{aclStore}'
                },
            
            listeners: {
                afterrender: function(me) {
                    Ext.create('Ext.tip.ToolTip', {
                        target: me.getId(),
                        showDelay: 750,
                        dismissDelay: 10000,
                        title: me.fieldLabel,
                        html: 'Список доступа, автоматически присваеваемый новым пользователям.'
                        });
                    }
                }
            },
            {
            xtype: 'container',
            layout: 'auto',
            hidden: true,
            
            bind: {
                hidden: '{hideEditableControls}'
                },
                
            items: [
                {
                xtype: 'button',
                width: 100,
                text: 'Добавить',
                handler: 'onAddAclClick'
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Удалить',
                handler: 'onRemoveAclClick',
                disabled: true,

                bind: {
                    disabled: '{gridSelectionEmpty}'
                    }
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Сохранить',
                handler: 'onSaveAclClick',
                disabled: true,
                
                bind: {
                    disabled: '{!settingsRecordAndStoreStatus.dirtyAndValid}'
                    }
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Отменить',
                handler: 'onRevertAclClick',
                disabled: true,

                bind: {
                    disabled: '{!settingsRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'grid',
        reference: 'aclGridRef',
        columnLines: true,
        flex: 1,     

        bind: {
            store: '{aclStore}'
            },
        
        listeners: {
            selectionChange: 'onAclGridSelectionChange'
            },
        
        columns: [
            {
            dataIndex: 'id',
            hidden: true,
            hideable: false
            },
            {
            text: 'Список доступа',
            dataIndex: 'name',
            width: 415
            }]
        }]
    })