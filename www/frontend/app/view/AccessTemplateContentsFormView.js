Ext.define('tentacles.view.AccessTemplateContentsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.accesstemplatecontentsformview',
    
    requires: [
        'tentacles.view.AccessTemplateContentsFormViewController'
        ],

    viewModel: {
        data: {
            storeIsDirty: false,
            fromGridSelectionEmpty: true,
            toGridSelectionEmpty: true,
            canMoveUp: false,
            canMoveDown: false
            },
            
        links: {
            selectedAccessTemplate: {
                reference: 'AccessTemplateModel',
                create: true
                }
            },

        stores: {
            urlListStore: {
                model: 'UrlListModel',
                pageSize: 0,
                autoLoad: true,
                
                listeners: {
                    load: 'onUrlListStoreLoad'
                    }
                },
            
            accessTemplateContentsStore: {
                model: 'AccessTemplateContentsModel',
                pageSize: 0,
                autoLoad: false,
                sorters: 'orderNumber',

                listeners: {
                    datachanged: 'onAccessTemplateContentsStoreDataChanged'
                    }
                }
            },
            
        formulas: {
            accessTemplateRecordStatus: {
                bind: {
                    bindTo: '{selectedAccessTemplate}',
                    deep: true
                    },

                get: function(accessTemplate) {
                    var result = {
                        dirty: accessTemplate ? accessTemplate.dirty : false,
                        valid: accessTemplate ? accessTemplate.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                },
                
            accessTemplateRecordAndStoreStatus: function (get) {
                var result = {
                    dirty: get('accessTemplateRecordStatus').dirty || get('storeIsDirty'),
                    valid: get('accessTemplateRecordStatus').valid
                    };

                result.dirtyAndValid = result.dirty && result.valid;

                return result;
                },
                
            hideEditableControls: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'EditSettings') == -1;
                },
                
            selectTemplatesControlWidth: function(get) {
                return this.get('hideEditableControls') ? 335 : 750;
                }
            }
        },

    controller: 'accesstemplatecontentsformviewcontroller',
    
    modelValidation: true,
        
    bodyPadding: 10,
    
    layout: {
        type: 'vbox',
        align: 'left',
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
            labelWidth: 120,
            fieldLabel: 'Шаблон доступа',
            hidden: false,

            bind: {
                value: '{selectedAccessTemplate.name}',
                hidden: '{!hideEditableControls}'
                }
            },
            {
            xtype: 'textfield',
            fieldLabel: 'Шаблон доступа',
            width: 415,
            labelWidth: 120,
            hidden: true,

            bind: {
                value: '{selectedAccessTemplate.name}',
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
                handler: 'onSaveAccessTemplateContentsClick',
                disabled: true,

                bind: {
                    disabled: '{!accessTemplateRecordAndStoreStatus.dirtyAndValid}'
                    }
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Отменить',
                handler: 'onRevertAccessTemplateContentsClick',
                disabled: true,

                bind: {
                    disabled: '{!accessTemplateRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'container',
        layout: 'hbox',
        width: 750,

        bind: {
            width: '{selectTemplatesControlWidth}'
            },
        
        items: [
            {
            xtype: 'grid',
            reference: 'fromGridRef',
            title: 'Доступные списки URL',
            flex: 0.5,
            hidden: true,
            
            bind: {
                hidden: '{hideEditableControls}'
                },
                
            listeners: {
                selectionChange: 'onFromGridSelectionChange'
                },
            
            columns: [
                {
                dataIndex: 'id',
                hidden: true,
                hideable: false
                },
                {
                text: 'Список URL',
                dataIndex: 'name',
                flex: 1
                },
                {
                xtype: 'booleancolumn',
                text: 'Белый список',
                dataIndex: 'whitelist',
                width: 120,
                trueText: '✓',
                falseText: '',
                align: 'center'
                }]
            },
            {
            xtype: 'container',            
            margin: '0 10 0 10',
            
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
                },
                
            hidden: true,
            
            bind: {
                hidden: '{hideEditableControls}'
                },
            
            items: [
                {
                xtype: 'button',
                text: 'Вверх',
                handler: 'onUpClick',
                
                bind: {
                    disabled: '{!canMoveUp}'
                    }
                },
                {
                xtype: 'button',
                margin: '5 0 0 0',
                text: '>',
                handler: 'onAddClick',
                
                bind: {
                    disabled: '{fromGridSelectionEmpty}'
                    }
                },
                {
                xtype: 'button',
                margin: '5 0 0 0',
                text: '<',
                handler: 'onRemoveClick',
                
                bind: {
                    disabled: '{toGridSelectionEmpty}'
                    }
                },
                {
                xtype: 'button',
                margin: '5 0 0 0',
                text: 'Вниз',
                handler: 'onDownClick',
                
                bind: {
                    disabled: '{!canMoveDown}'
                    }
                }]
            },
            {
            xtype: 'grid',
            reference: 'toGridRef',
            title: 'Выбранные списки URL',
            flex: 0.5,
            sortableColumns: false,
            
            bind: {
                store: '{accessTemplateContentsStore}'
                },
                
            listeners: {
                selectionChange: 'onToGridSelectionChange'
                },
                                    
            columns: [
                {
                dataIndex: 'id',
                hidden: true,
                hideable: false
                },
                {
                text: 'Список URL',
                flex: 1,                
                renderer: 'renderUrlListName'
                },
                {
                text: 'Белый список',
                width: 120,
                align: 'center',                
                renderer: 'renderUrlListWhitelist'
                }]
            }]
        }]
    })