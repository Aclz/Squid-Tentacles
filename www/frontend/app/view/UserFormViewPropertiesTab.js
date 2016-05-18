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
                    {id: 0, name: 'Пользователь'},
                    {id: 1, name: 'IP-адрес'}
                    ]
                },
                
            aclStore: {
                model: 'tentacles.model.AclModel',
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
                
            extraQuotaDisplayFieldHidden: function(get) {
                return get('selectedUser.extraQuota') == undefined || get('selectedUser.extraQuota') == 0;
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
                
            aclDisplayFieldHidden: function(get) {
                return get('selectedUser.aclId') == undefined || !get('hideEditableControls');
                },
                
            aclComboboxHidden: function(get) {
                return get('selectedUser.aclId') == undefined || get('hideEditableControls');
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
                },
                
            extraQuotaText: {
                bind: {
                    bindTo: '{selectedUser}',
                    deep: true
                    },

                get: function(user) {
                    if (!user || !user.get('quota')) {
                        return '';
                        }
                                    
                    return user.get('quota') != 0 ? ' + ' + user.get('quota') : '';
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
        
        bind: {
            value: '{selectedUser.cn}'
            },

        listeners: {
            afterrender: function(me) {           
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Имя пользователя в Active Directory.'
                    });
                }
            }
        },      
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Логин',
        
        bind: {
            value: '{selectedUser.userPrincipalName}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Логин пользователя в Active Directory.'
                    });
                }
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
            
        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: 'Квота',
                    html: 'Месячный объем трафика, после расхода которого<br>' +
                        'пользователь будет заблокирован.'
                    });
                }
            },

        renderer: Ext.util.Format.numberRenderer('0.00')
        },
        {
        xtype: 'numberfield',
        width: 250,
        labelWidth: 150,
        fieldLabel: 'Квота, Мб',
        minValue: 0,
        maxValue: 499999999999, //would be enough
        hidden: true,

        bind: {
            value: '{selectedUser.quota}',
            hidden: '{quotaNumberFieldHidden}'
            },
            
        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: 'Квота',
                    html: 'Месячный объем трафика, после расхода которого<br>' +
                        'пользователь будет заблокирован.'
                    });
                }
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Доп. квота, Мб',
        hidden: true,

        bind: {
            value: '{selectedUser.extraQuota}',
            hidden: '{quotaDisplayFieldHidden}'
            },
            
        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: 'Дополнительная квота',
                    html: 'Объем трафика, на который увеличивается квота в текущем месяце.<br>' +
                        'По наступлении следующего месяца данный параметр обнуляется.'
                    });
                }
            },
            
        renderer: Ext.util.Format.numberRenderer('0.00')
        },
        {
        xtype: 'numberfield',
        width: 250,
        labelWidth: 150,
        fieldLabel: 'Доп. квота, Мб',
        minValue: 0,
        maxValue: 499999999999,
        hidden: true,
        
        bind: {
            value: '{selectedUser.extraQuota}',
            hidden: '{quotaNumberFieldHidden}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: 'Дополнительная квота',
                    html: 'Объем трафика, на который увеличивается квота в текущем месяце.<br>' +
                        'По наступлении следующего месяца данный параметр обнуляется.'
                    });
                }
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

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: 'Расход трафика',
                    html: 'Объем трафика, скачанного пользователем в текущем месяце.'
                    });
                }
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
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Принимает следующие значения:<br>' +
                        '<ul><li><b>Активен</b> - пользователь включен;</li>' +
                        '<li><b>Отключен за превышение квоты</b> - пользователь отключен до начала следующего месяца;</li>' +
                        '<li><b>Заблокирован</b> - пользователь отключен до разблокировки администратором вручную.</li></ul>'
                    });
                }
            }
        }, 
        {
        xtype: 'combobox',
        reference: 'userstatuscombobox',
        width: 415,
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
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Принимает следующие значения:<br>' +
                        '<ul><li><b>Активен</b> - пользователь включен;</li>' +
                        '<li><b>Отключен за превышение квоты</b> - пользователь отключен до начала следующего месяца;</li>' +
                        '<li><b>Заблокирован</b> - пользователь отключен до разблокировки администратором вручную.</li></ul>'
                    });
                }
            }
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Авторизация',
        hidden: true,

        bind: {
            value: '{userauthmethodcombobox.selection.name}',
            hidden: '{authMethodDisplayFieldHidden}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Принимает следующие значения:<br>' +
                        '<ul><li><b>Пользователь</b> - авторизация в Squid и URL-редиректоре осуществляется по имени пользователя;</li>' +
                        '<li><b>IP-адрес</b> - авторизация в Squid и URL-редиректоре осуществляется по IP-адресу пользователя.</li></ul>'
                    });
                }
            }
        },
        {
        xtype: 'combobox',
        reference: 'userauthmethodcombobox',
        width: 415,
        labelWidth: 150,
        fieldLabel: 'Авторизация',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',

        bind: {
            value: '{selectedUser.authMethod}',
            hidden: '{authMethodComboboxHidden}',
            store: '{authMethodsStore}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Принимает следующие значения:<br>' +
                        '<ul><li><b>Пользователь</b> - авторизация в Squid и URL-редиректоре осуществляется по имени пользователя;</li>' +
                        '<li><b>IP-адрес</b> - авторизация в Squid и URL-редиректоре осуществляется по IP-адресу пользователя.</li></ul>'
                    });
                }
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
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'IP-адрес пользователя в случае IP-авторизации.'
                    });
                }
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

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'IP-адрес пользователя в случае IP-авторизации.'
                    });
                }
            },
            
        maskRe: /[\d\.]/
        },
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Список доступа',
        hidden: true,

        bind: {
            value: '{useraclcombobox.selection.name}',
            hidden: '{aclDisplayFieldHidden}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Определяет множество URL, доступных или недоступных пользователю.'
                    });
                }
            }
        },
        {
        xtype: 'combobox',
        reference: 'useraclcombobox',
        width: 415,
        labelWidth: 150,
        fieldLabel: 'Список доступа',
        editable: false,
        hidden: true,
        displayField: 'name',
        valueField: 'id',
        autoLoadOnValue: true,

        bind: {
            value: '{selectedUser.aclId}',
            hidden: '{aclComboboxHidden}',
            store: '{aclStore}'
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Определяет множество URL, доступных или недоступных пользователю.'
                    });
                }
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
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Определяет набор прав пользователя в данном приложении.'
                    });
                }
            }
        },
        {
        xtype: 'combobox',
        reference: 'userrolecombobox',
        width: 415,
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
            },

        listeners: {
            afterrender: function(me) {
                Ext.create('Ext.tip.ToolTip', {
                    target: me.getId(),
                    showDelay: 750,
                    dismissDelay: 10000,
                    title: me.fieldLabel,
                    html: 'Определяет набор прав пользователя в данном приложении.'
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