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
            
        stores: {
            accessTemplateStore: {
                model: 'AccessTemplateModel',

                pageSize: 1000,

                autoLoad: false,

                listeners: {                    
                    datachanged: 'onAccessTemplateStoreDataChanged'
                    }
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
        layout: 'auto',

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
                disabled: '{!storeIsDirty}'
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
                disabled: '{!storeIsDirty}'
                }
            }]
        },
        {
        xtype: 'grid',
        reference: 'accessTemplateGridRef',      

        bind: {
            store: '{accessTemplateStore}'
            },
            
        margin: '10 0 0 0',
        
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