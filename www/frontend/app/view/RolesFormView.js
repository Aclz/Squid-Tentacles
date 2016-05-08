Ext.define('tentacles.view.RolesFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.rolesformview',
    
    requires: [
        'tentacles.view.RolesFormViewController'
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
            roleStore: {
                model: 'RoleModel',

                pageSize: 0,

                autoLoad: false,

                listeners: {                    
                    datachanged: 'onRoleStoreDataChanged',
                    load: 'onRoleStoreLoad'
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
                return this.get('myPermissionsStore').findExact('permissionName', 'EditPermissions') == -1;
                }
            }
        },
        
    controller: 'rolesformviewcontroller',
        
    layout: {
        type: 'vbox',
        align: 'stretch',
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
            labelWidth: 220,
            fieldLabel: 'Роль пользователя по-умолчанию',
            hidden: false,

            bind: {
                value: '{defaultrolecombobox.selection.name}',
                hidden: '{!hideEditableControls}'
                }
            },
            {
            xtype: 'combobox',
            reference: 'defaultrolecombobox',
            width: 415,
            labelWidth: 220,
            fieldLabel: 'Роль пользователя по-умолчанию',
            editable: false,
            hidden: true,

            store: {
                model: 'tentacles.model.RoleModel',
                autoload: false
                },

            displayField: 'name',
            valueField: 'id',
            autoLoadOnValue: true,

            bind: {
                value: '{settings.defaultRoleId}',
                hidden: '{hideEditableControls}'
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
                handler: 'onAddRoleClick'
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Удалить',
                handler: 'onRemoveRoleClick',
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
                handler: 'onSaveRoleClick',
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
                handler: 'onRevertRoleClick',
                disabled: true,

                bind: {
                    disabled: '{!settingsRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'grid',
        reference: 'roleGridRef',
        flex: 1,    

        bind: {
            store: '{roleStore}'
            },
        
        listeners: {
            selectionChange: 'onRoleGridSelectionChange'
            },
        
        columns: [
            {
            dataIndex: 'id',
            hidden: true,
            hideable: false
            },
            {
            text: 'Роль',
            dataIndex: 'name',
            width: 200
            }]
        }]
    })