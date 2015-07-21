Ext.define('tentacles.view.AccessTemplateContentsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.accesstemplatecontentsformview',
    
    requires: [
        'tentacles.view.AccessTemplateContentsFormViewController'
        ],

    viewModel: {
        data: {
            storeIsDirty: false,
            gridSelectionEmpty: true
            },
            
        links: {
            currentAccessTemplate: {
                reference: 'AccessTemplateModel',
                create: true
                }
            },

        stores: {
            accessTemplateContentsStore: {
                model: 'UrlListModel',

                pageSize: 1000,

                autoLoad: false,

                listeners: {
                    beforeload: 'beforeLoadAccessTemplateContentsStore',
                    write: 'writeAccessTemplateContentsStore',
                    datachanged: 'onAccessTemplateContentsStoreDataChanged'
                    }
                }
            },
            
        formulas: {
            accessTemplateRecordStatus: {
                bind: {
                    bindTo: '{currentAccessTemplate}',
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
                }
            }
        },

    controller: 'accesstemplatecontentsformviewcontroller',
    
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
			fieldLabel: 'Шаблон доступа',
			width: 415,
            labelWidth: 120,

			bind: {
				value: '{currentAccessTemplate.name}'
				}
			},
            {
            xtype: 'checkboxfield',
            fieldLabel: 'Белый список',
            boxLabel: '(запрещено всё, что явно не разрешено)',
            labelWidth: 120,

			bind: {
				value: '{currentAccessTemplate.whitelist}'
				}
            },
            {
            xtype: 'button',
			width: 100,
            text: 'Добавить',
            handler: 'onAddAccessTemplateContentClick'
            },
            {
            xtype: 'button',
			width: 100,
			margin: '0 0 0 5',
            text: 'Удалить',
            handler: 'onRemoveAccessTemplateContentClick',
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
    })