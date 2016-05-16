Ext.define('tentacles.view.AclContentsFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.aclcontentsformview',
    
    requires: [
        'tentacles.view.AclContentsFormViewController'
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
            selectedAcl: {
                reference: 'AclModel',
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
            
            aclContentsStore: {
                model: 'AclContentsModel',
                pageSize: 0,
                autoLoad: false,
                sorters: 'orderNumber',

                listeners: {
                    datachanged: 'onAclContentsStoreDataChanged'
                    }
                }
            },
            
        formulas: {
            aclRecordStatus: {
                bind: {
                    bindTo: '{selectedAcl}',
                    deep: true
                    },

                get: function(acl) {
                    var result = {
                        dirty: acl ? acl.dirty : false,
                        valid: acl ? acl.isValid() : false
                        };

                    result.dirtyAndValid = result.dirty && result.valid;

                    return result;
                    }
                },
                
            aclRecordAndStoreStatus: function (get) {
                var result = {
                    dirty: get('aclRecordStatus').dirty || get('storeIsDirty'),
                    valid: get('aclRecordStatus').valid
                    };

                result.dirtyAndValid = result.dirty && result.valid;

                return result;
                },
                
            hideEditableControls: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'EditSettings') == -1;
                },
                
            aclPickerControlWidth: function(get) {
                return this.get('hideEditableControls') ? 335 : 750;
                }
            }
        },

    controller: 'aclcontentsformviewcontroller',
    
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
            fieldLabel: 'Список доступа',
            hidden: false,

            bind: {
                value: '{selectedAcl.name}',
                hidden: '{!hideEditableControls}'
                }
            },
            {
            xtype: 'textfield',
            fieldLabel: 'Список доступа',
            width: 415,
            labelWidth: 120,
            hidden: true,

            bind: {
                value: '{selectedAcl.name}',
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
                handler: 'onSaveAclContentsClick',
                disabled: true,

                bind: {
                    disabled: '{!aclRecordAndStoreStatus.dirtyAndValid}'
                    }
                },
                {
                xtype: 'button',
                width: 100,
                margin: '0 0 0 5',
                text: 'Отменить',
                handler: 'onRevertAclContentsClick',
                disabled: true,

                bind: {
                    disabled: '{!aclRecordAndStoreStatus.dirty}'
                    }
                }]
            }]
        },
        {
        xtype: 'container',
        layout: 'hbox',
        width: 750,

        bind: {
            width: '{aclPickerControlWidth}'
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
                store: '{aclContentsStore}'
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