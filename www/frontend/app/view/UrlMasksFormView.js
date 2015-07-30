Ext.define('tentacles.view.UrlMasksFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.urlmasksformview',
    
    requires: [
        'tentacles.view.UrlMasksFormViewController'
        ],

    viewModel: {
        data: {
            storeIsDirty: false,
            gridSelectionEmpty: true
            },
			
		links: {
            currentUrlList: {
                reference: 'UrlListModel',
                create: true
                }
            },
            
        stores: {
            urlMaskStore: {
                model: 'UrlMaskModel',

                pageSize: 1000,

                autoLoad: false,

                listeners: { 
                    write: 'writeUrlMaskStore',                   
                    datachanged: 'onUrlMaskStoreDataChanged',
                    load: 'onUrlMaskStoreLoad'
                    }
                }
            },
            
        formulas: {
            urlListRecordStatus: {
                bind: {
                    bindTo: '{currentUrlList}',
                    deep: true
                    },

                get: function(urlList) {
                    var result = {
                        dirty: urlList ? urlList.dirty : false,
                        valid: urlList ? urlList.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                },
                
            urlListRecordAndStoreStatus: function (get) {
                var result = {
                    dirty: get('urlListRecordStatus').dirty || get('storeIsDirty'),
                    valid: get('urlListRecordStatus').valid
                    };

                result.dirtyAndValid = result.dirty && result.valid;

                return result;
                }
            }
        },
        
    controller: 'urlmasksformviewcontroller',
    
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

        items: [{
			xtype: 'textfield',
			fieldLabel: 'Список URL',
			width: 415,
            labelWidth: 120,

			bind: {
				value: '{currentUrlList.name}'
				}
			},
            {
            xtype: 'checkboxfield',
            fieldLabel: 'Белый список',
            boxLabel: '(запрещено всё, что явно не разрешено)',
            labelWidth: 120,

			bind: {
				value: '{currentUrlList.whitelist}'
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
				disabled: '{!urlListRecordAndStoreStatus.dirtyAndValid}'
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
				disabled: '{!urlListRecordAndStoreStatus.dirty}'
				}
			}]
		},
        {
        xtype: 'grid',
        reference: 'urlMaskGridRef',      

        bind: {
            store: '{urlMaskStore}'
            },
        
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