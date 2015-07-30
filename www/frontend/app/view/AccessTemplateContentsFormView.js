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
            currentAccessTemplate: {
                reference: 'AccessTemplateModel',
                create: true
                }
            },

        stores: {
            urlListStore: {
                model: 'UrlListModel',
                pageSize: 1000,
                autoLoad: true,
				
				listeners: {
					load: 'onUrlListStoreLoad'
					}
                },
			
            accessTemplateContentsStore: {
                model: 'AccessTemplateContentsModel',
                pageSize: 1000,
                autoLoad: false,
                sorters: 'orderNumber',

                listeners: {
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
        align: 'left',
        pack: 'start'
        },
        
    items: [
        {
        xtype: 'textfield',
        fieldLabel: 'Шаблон доступа',
        labelWidth: 120,

        bind: {
            value: '{currentAccessTemplate.name}'
            }
		},
		{
		xtype: 'container',
		layout: 'auto',
		margin: '0 5 10 0',

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
        },
		{
		xtype: 'container',
		layout: 'hbox',
		width: 750,		
		
		items: [
			{
			xtype: 'grid',
			reference: 'fromGridRef',
			title: 'Доступные списки URL',
			flex: 0.5,
			
			bind: {
				store: '{urlListStore}'
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