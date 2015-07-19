Ext.define('tentacles.view.UrlListsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.urllistsformview',
    
    requires: [
        'tentacles.view.UrlListsFormViewController'
        ],
	
    bodyPadding: 10,

    viewModel: {
        data: {
            gridSelectionEmpty: true
            },
            
        stores: {
            urlListStore: {
                model: 'UrlListModel',

                pageSize: 1000,

                autoLoad: false,

                listeners: {                   
                    datachanged: 'onUrlListStoreDataChanged'
                    }
                }
            }
        },
        
    controller: 'urllistsformviewcontroller',
        
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
            handler: 'onAddUrlListClick'
            },
            {
            xtype: 'button',
            width: 100,
            margin: '0 0 0 5',
            text: 'Удалить',
            handler: 'onRemoveUrlListClick',
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
            handler: 'onSaveUrlListClick',
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
            handler: 'onRevertUrlListClick',
            disabled: true,

            bind: {
                disabled: '{!storeIsDirty}'
                }
            }]
        },
        {
        xtype: 'grid',
        reference: 'urlListGridRef',      

        bind: {
            store: '{urlListStore}'
            },
            
        margin: '10 0 0 0',
        
        listeners: {
            selectionChange: 'onUrlListGridSelectionChange'
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
            width: 200
            }]
        }]
    })