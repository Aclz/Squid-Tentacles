Ext.define('tentacles.view.SettingsFormView', {
    extend: 'Ext.form.Panel',
	
    alias: 'widget.settingsformview',
    
    requires: [
        'tentacles.view.SettingsFormViewController'
        ],
        
    viewModel: {
        links: {
            settings: {
                reference: 'SettingsModel',
                create: true
                }
            },
            
        formulas: {
            recordStatus: {
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
                }
            }
        },
    
    controller: 'settingsformviewcontroller',
	
    bodyPadding: 10,
	
    items: [{
        xtype: 'combobox',
        width: 390,
        labelWidth: 200,
        fieldLabel: 'Шаблон доступа по-умолчанию',
        editable: false,
        
        store: {
            model: 'tentacles.model.AccessTemplateModel',
            autoload: false
            },
            
        displayField: 'name',
        valueField: 'id',
        autoLoadOnValue: true,

        bind: {
            value: '{settings.defaultAccessTemplate}'
            }
        },
        {
        xtype: 'button',
        text: 'Сохранить',
        handler: 'onSaveSettingsClick',
        disabled: true,
        width: 100,

        bind: {
            disabled: '{!recordStatus.dirtyAndValid}'
            }
        },
        {
        xtype: 'button',
        text: 'Отменить',
        handler: 'onRevertSettingsClick',
        disabled: true,
        margin: '0 0 0 5',
        width: 100,

        bind: {
            disabled: '{!recordStatus.dirty}'
            }
        }]
    })