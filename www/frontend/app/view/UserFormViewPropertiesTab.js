Ext.define('tentacles.view.UserFormViewPropertiesTab', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.userformviewproperties',
    
    viewModel: {
        stores: {
            statusesStore: {
                data: [
                    {id: 0, name: 'Заблокирован'},
                    {id: 1, name: 'Активен'},
                    {id: 2, name: 'Отключен за превышение квоты'}
                    ]
                },
                
            authMethodsStore: {
                data: [
                    {id: 0, name: 'Kerberos'},
                    {id: 1, name: 'IP'}
                    ]
                },
                
            accessTemplatesStore: {
                model: 'tentacles.model.AccessTemplateModel',
                autoLoad: false
                },
                
            rolesStore: {
                model: 'tentacles.model.RoleModel',
                autoLoad: false
                }
            },
            
        formulas: {
            quotaDisplayFieldHidden: function(get) {
                return get('selectedUser.quota') == undefined || !get('hideEditableControls');
                },
                
            quotaNumberFieldHidden: function(get) {
                return get('selectedUser.quota') == undefined || get('hideEditableControls');
                },
                
            trafficDisplayFieldHidden: function(get) {
                return get('selectedUser.traffic') == undefined;
                },
                
            statusDisplayFieldHidden: function(get) {
                return get('selectedUser.status') == undefined || !get('hideEditableControls');
                },

            statusComboboxHidden: function(get) {
                return get('selectedUser.status') == undefined || get('hideEditableControls');
                },
                
            authMethodDisplayFieldHidden: function(get) {
                return get('selectedUser.authMethod') == undefined || !get('hideEditableControls');
                },

            authMethodComboboxHidden: function(get) {
                return get('selectedUser.authMethod') == undefined || get('hideEditableControls');
                },
                
            ipAddressTextFieldHidden: function(get) {
                return get('selectedUser.authMethod') != 1 || get('hideEditableControls');
                },
                
            ipAddressDisplayFieldHidden: function(get) {
                return get('selectedUser.authMethod') != 1 || !get('hideEditableControls');
                },
                
            accessTemplateDisplayFieldHidden: function(get) {
                return get('selectedUser.accessTemplateId') == undefined || !get('hideEditableControls');
                },
                
            accessTemplateComboboxHidden: function(get) {
                return get('selectedUser.accessTemplateId') == undefined || get('hideEditableControls');
                },
                
            roleDisplayFieldHidden: function(get) {
                return get('selectedUser.roleId') == undefined || (!get('hideEditableControls') &&
                    this.get('myPermissionsStore').findExact('permissionName', 'EditPermissions') != -1);
                },
                
            roleComboboxHidden: function(get) {
                return get('selectedUser.roleId') == undefined || get('hideEditableControls') ||
                    this.get('myPermissionsStore').findExact('permissionName', 'EditPermissions') == -1;
                },
                
            hideEditableControls: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'EditUsers') == -1;
                },
                
            userRecordStatus: {
                bind: {
                    bindTo: '{selectedUser}',
                    deep: true
                    },

                get: function(user) {
                    var result = {
                        dirty: user ? user.dirty : false,
                        valid: user ? user.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                }
            }
        },
        
    modelValidation: true,
    
    title: 'Свойства',

    items: [        
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'ФИО',
        bind: {value: '{selectedUser.cn}'}
        },        
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Логин',
        
        bind: {
            value: '{selectedUser.userPrincipalName}'
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Квота, Мб',
        hidden: true,

        bind: {
            value: '{selectedUser.quota}',
            hidden: '{quotaDisplayFieldHidden}'
            },

        renderer: Ext.util.Format.numberRenderer('0.00')
        },
        {
        xtype: 'numberfield',
        width: 280,
        labelWidth: 150,
        fieldLabel: 'Квота, Мб',
        minValue: 0,
        maxValue: 999999999999, //seems to be enough
        hidden: true,

        bind: {
            value: '{selectedUser.quota}',
            hidden: '{quotaNumberFieldHidden}'
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Расход, Мб',
        hidden: true,
        
        bind: {
            value: '{selectedUser.traffic}',
            hidden: '{trafficDisplayFieldHidden}'
            },
            
        renderer: Ext.util.Format.numberRenderer('0.00')
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Состояние',
        hidden: true,

        bind: {
            value: '{userstatuscombobox.selection.name}',
            hidden: '{statusDisplayFieldHidden}'
            }
        }, 
        {
        xtype: 'combobox',
        reference: 'userstatuscombobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Состояние',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',
        
        bind: {
            value: '{selectedUser.status}',
            hidden: '{statusComboboxHidden}',
            store: '{statusesStore}'
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Аутентификация',
        hidden: true,

        bind: {
            value: '{userauthmethodcombobox.selection.name}',
            hidden: '{authMethodDisplayFieldHidden}'
            }
        },
        {
        xtype: 'combobox',
        reference: 'userauthmethodcombobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Аутентификация',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',

        bind: {
            value: '{selectedUser.authMethod}',
            hidden: '{authMethodComboboxHidden}',
            store: '{authMethodsStore}'
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'IP-адрес',
        hidden: true,

        bind: {
            value: '{selectedUser.ip}',
            hidden: '{ipAddressDisplayFieldHidden}'
            }
        },
        {
        xtype: 'textfield',
        width: 280,
        labelWidth: 150,
        fieldLabel: 'IP-адрес',
        maxLength: 15,
        enforceMaxLength: true,
        hidden: true,
        
        bind: {
            value: '{selectedUser.ip}',
            hidden: '{ipAddressTextFieldHidden}'
            },
            
        maskRe: /[\d\.]/
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Шаблон доступа',
        hidden: true,

        bind: {
            value: '{useraccesstemplatecombobox.selection.name}',
            hidden: '{accessTemplateDisplayFieldHidden}'
            }
        },
        {
        xtype: 'combobox',
        reference: 'useraccesstemplatecombobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Шаблон доступа',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',
        autoLoadOnValue: true,

        bind: {
            value: '{selectedUser.accessTemplateId}',
            hidden: '{accessTemplateComboboxHidden}',
            store: '{accessTemplatesStore}'
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Роль',
        hidden: true,

        bind: {
            value: '{userrolecombobox.selection.name}',
            hidden: '{roleDisplayFieldHidden}'
            }
        },
        {
        xtype: 'combobox',
        reference: 'userrolecombobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Роль',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',
        autoLoadOnValue: true,

        bind: {
            value: '{selectedUser.roleId}',
            hidden: '{roleComboboxHidden}',
            store: '{rolesStore}'
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
            text: 'Сохранить',
            width: 100,
            handler: 'onSaveUserClick',
            disabled: true,
            
            bind: {
                disabled: '{!userRecordStatus.dirtyAndValid}'
                }
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Отменить',
            handler: 'onRevertUserClick',
            disabled: true,
            margin: '0 0 0 5',

            bind: {
                disabled: '{!userRecordStatus.dirty}'
                }
            }]
        }]
    })