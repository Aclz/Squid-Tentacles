Ext.define('tentacles.view.UserFormViewPropertiesTab', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.userformviewproperties',
    
    viewModel: {
        formulas: {
            isIpAuth: function(get) {
                return get('currentUser.authMethod') != 1;
                },
            
            userRecordStatus: {
                bind: {
                    bindTo: '{currentUser}',
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
        bind: {value: '{currentUser.cn}'}
        },        
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Логин',
        
        bind: {
            value: '{currentUser.userPrincipalName}'
            }
        },        
        {
        xtype: 'numberfield',
        width: 280,
        labelWidth: 150,
        fieldLabel: 'Квота, Мб',
        minValue: 0,
        maxValue: 999999999999, //~1 Pb seems to be enough
        
        bind: {
            value: '{currentUser.quota}'
            }
        },    
        {
        xtype: 'displayfield',
        labelWidth: 150,
        fieldLabel: 'Расход, Мб',
        bind: {value: '{currentUser.traffic}'},
        renderer: Ext.util.Format.numberRenderer('0.00')
        },    
        {
        xtype: 'combobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Состояние',
        editable: false,
        
        store:[
            [0,'Заблокирован'],
            [1,'Активен'],
            [2,'Отключен за превышение квоты']
            ],
        
        bind: {
            value: '{currentUser.status}'
            }
        },
        {
        xtype: 'combobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Аутентификация',
        editable: false,

        store:[
            [0,'Kerberos'],
            [1,'IP']
            ],

        bind: {
            value: '{currentUser.authMethod}'
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
            value: '{currentUser.ip}',
            hidden: '{isIpAuth}'
            },
            
        maskRe: /[\d\.]/
        },
        {
        xtype: 'combobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Шаблон доступа',
        editable: false,

        store: {
            model: 'tentacles.model.AccessTemplateModel',
            autoload: false
            },

        displayField: 'name',
        valueField: 'id',
        autoLoadOnValue: true,

        bind: {
            value: '{currentUser.accessTemplateId}'
            }
        },
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
    })