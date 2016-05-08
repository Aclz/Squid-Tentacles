Ext.define('tentacles.view.RolePermissionsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.rolepermissionsformview',
    
    requires: [
        'tentacles.view.RolePermissionsFormViewController'
        ],

    viewModel: {
        data: {
            storeIsDirty: false
            },
            
        links: {
            selectedRole: {
                reference: 'RoleModel',
                create: true
                }
            },
            
        stores: {
            permissionsStore: {
                model: 'PermissionModel',
                pageSize: 0,
                autoLoad: false,

                listeners: {
                    load: 'onPermissionsStoreLoad'
                    }
                },

            rolePermissionsStore: {
                model: 'RolePermissionModel',
                pageSize: 0,
                autoLoad: false,

                listeners: {                  
                    datachanged: 'onRolePermissionsStoreDataChanged',
                    load: 'onRolePermissionsStoreLoad'
                    }
                },
                
            gridStore: {
                fields: [
                    {name: 'permissionName', type: 'string'},
                    {name: 'permissionDescription', type: 'string'},
                    {name: 'permissionAllowed', type: 'bool'}
                    ],

                pageSize: 0,
                autoLoad: false,
                
                listeners: {
                    update: 'onGridStoreUpdate'
                    }
                }
            },
            
        formulas: {
            roleRecordStatus: {
                bind: {
                    bindTo: '{selectedRole}',
                    deep: true
                    },

                get: function(role) {
                    var result = {
                        dirty: role ? role.dirty : false,
                        valid: role ? role.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                },
                
            roleRecordAndStoreStatus: function(get) {
                var result = {
                    dirty: get('roleRecordStatus').dirty || get('storeIsDirty'),
                    valid: get('roleRecordStatus').valid
                    };

                result.dirtyAndValid = result.dirty && result.valid;

                return result;
                },
                
            hideEditableControls: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'EditPermissions') == -1;
                },
            }
        },
        
    controller: 'rolepermissionsformviewcontroller',
    
    modelValidation: true,
    
    bodyPadding: 10,    
        
    layout: {
        type: 'vbox',
        align: 'stretch',
        pack: 'start'
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
            labelWidth: 50,
            fieldLabel: 'Роль',
            hidden: false,

            bind: {
                value: '{selectedRole.name}',
                hidden: '{!hideEditableControls}'
                }
            },
            {
            xtype: 'textfield',            
            width: 415,
            labelWidth: 50,
            fieldLabel: 'Роль',
            hidden: true,

            bind: {
                value: '{selectedRole.name}',
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
                text: 'Сохранить',
                handler: 'onSaveRolePermissionsClick',
                disabled: true,

                bind: {
                    disabled: '{!roleRecordAndStoreStatus.dirtyAndValid}'
                    }
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Отменить',
                handler: 'onRevertRolePermissionsClick',
                disabled: true,

                bind: {
                    disabled: '{!roleRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'grid',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,

        bind: {
            store: '{gridStore}'
            },

        viewConfig: {
            markDirty: false
            },

        columns: [
            {
            text: 'Привилегия',
            dataIndex: 'permissionDescription',
            flex: 1
            },
            {
            xtype: 'checkcolumn',
            text: 'Значение',
            dataIndex: 'permissionAllowed',
            width: 100,
            disabled: true,
            disabledCls: '',
            
            bind: {
                disabled: '{hideEditableControls}'
                }
            }]
        }]
    })