Ext.define('tentacles.view.AccessTemplatesFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.accesstemplatesformview',
    
    requires: [
        'tentacles.view.AccessTemplatesFormViewController'
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
            accessTemplateStore: {
                model: 'AccessTemplateModel',

                pageSize: 0,

                autoLoad: false,

                listeners: {                    
                    datachanged: 'onAccessTemplateStoreDataChanged',
                    load: 'onAccessTemplateStoreLoad'
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
        
    controller: 'accesstemplatesformviewcontroller',
        
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
            fieldLabel: 'Шаблон доступа по-умолчанию',
            hidden: false,

            bind: {
                value: '{defaultaccesstemplatecombobox.selection.name}',
                hidden: '{!hideEditableControls}'
                }
            },
            {
            xtype: 'combobox',
            reference: 'defaultaccesstemplatecombobox',
            width: 415,
            labelWidth: 205,
            fieldLabel: 'Шаблон доступа по-умолчанию',
            editable: false,
            hidden: true,

            /*store: {
                model: 'tentacles.model.AccessTemplateModel',
                autoload: false
                },*/

            displayField: 'name',
            valueField: 'id',
            autoLoadOnValue: true,

            bind: {
                value: '{settings.defaultAccessTemplateId}',
                hidden: '{hideEditableControls}',
                store: '{accessTemplateStore}'
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
                handler: 'onAddAccessTemplateClick'
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Удалить',
                handler: 'onRemoveAccessTemplateClick',
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
                handler: 'onSaveAccessTemplateClick',
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
                handler: 'onRevertAccessTemplateClick',
                disabled: true,

                bind: {
                    disabled: '{!settingsRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'grid',
        reference: 'accessTemplateGridRef',
        flex: 1,     

        bind: {
            store: '{accessTemplateStore}'
            },
        
        listeners: {
            selectionChange: 'onAccessTemplateGridSelectionChange'
            },
        
        columns: [
            {
            dataIndex: 'id',
            hidden: true,
            hideable: false
            },
            {
            text: 'Шаблон доступа',
            dataIndex: 'name',
            width: 200
            }]
        }]
    })