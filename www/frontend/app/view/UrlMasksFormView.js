Ext.define('tentacles.view.UrlMasksFormView', {
    extend: 'Ext.form.Panel',
	
    alias: 'widget.urlmasksformview',
    
    requires: [
        'tentacles.view.UrlMasksFormViewController'
        ],
	
    bodyPadding: 10,

    viewModel: {
        data: {
            currentUrlListId: 0,
            storeIsDirty: false,
            gridSelectionEmpty: true
            },
            
        stores: {
            urlMaskStore: {
                model: 'UrlMaskModel',

                pageSize: 1000,

                autoLoad: false,

                listeners: {
                    beforeload: 'beforeLoadUrlMaskStore', 
                    write: 'writeUrlMaskStore',                   
                    datachanged: 'onUrlStoreDataChanged'
                    }
                }
            }
        },
        
    controller: 'urlmasksformviewcontroller',
        
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
            xtype: 'displayfield',
            fieldLabel: 'Список URL',

            bind: {
                value: '{mainTreeViewRef.selection.text}'
                }
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Добавить',
            handler: 'onAddUrlMaskClick'
            },
            {
            xtype: 'button',
            width: 100,
            margin: '0 0 0 5',
            text: 'Удалить',
            handler: 'onRemoveUrlMaskClick',
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
            handler: 'onSaveUrlMaskClick',
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
            handler: 'onRevertUrlMaskClick',
            disabled: true,

            bind: {
                disabled: '{!storeIsDirty}'
                }
            }]
        },
        {
        xtype: 'grid',
        reference: 'urlMaskGridRef',      

        bind: {
            store: '{urlMaskStore}'
            },
            
        margin: '10 0 0 0',
        
        listeners: {
            selectionChange: 'onUrlMaskGridSelectionChange'
            },
        
        columns: [
            {
            dataIndex: 'id',
            hidden: true,
            hideable: false
            },
            {
            text: 'Маска URL',
            dataIndex: 'name',
            flex: 1
            }]
        }]
    })