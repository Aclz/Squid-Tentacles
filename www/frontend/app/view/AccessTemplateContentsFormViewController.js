Ext.define('tentacles.view.AccessTemplateContentsFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.accesstemplatecontentsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onAccessTemplateContentsSelect: 'onAccessTemplateContentsSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        if (this.getViewModel().get('accessTemplateRecordAndStoreStatus').dirty) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'ok') {
                        this.onSaveAccessTemplateContentsClick();
                        }

                    this.fireEvent('onTreeSelectionChange',{selected:args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange',{selected:args.selected});
            }
        },
        
    onAccessTemplateContentsStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty',(store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        
        var storeToIdArray = this.getStore('accessTemplateContentsStore').getData().getValues('urlListId','data');
        
        this.getStore('urlListStore').clearFilter();
        
        if (storeToIdArray.length != 0) {
            this.getStore('urlListStore').filterBy(function(record) {
                return storeToIdArray.indexOf(record.get('id')) == -1;
                });
            }
        },
        
    onAccessTemplateContentsSelect: function(selectedId) {
        this.getViewModel().linkTo('currentAccessTemplate',{reference: 'AccessTemplateModel',id: selectedId});
        
        if (this.getStore('urlListStore').isLoaded()) {
            this.loadAccessTemplateContentsStoreAndSyncPanels(selectedId);
            }
        },
        
    onFromGridSelectionChange: function(model,selected) {
        this.getViewModel().set('fromGridSelectionEmpty',selected.length == 0);
        },
        
    onToGridSelectionChange: function(model,selected) {
        this.getViewModel().set('toGridSelectionEmpty',selected.length == 0);
        
        this.getViewModel().set('canMoveUp',selected.length != 0 &&
            selected[0].get('id') != this.getStore('accessTemplateContentsStore').first().get('id'));
        
        this.getViewModel().set('canMoveDown',selected.length != 0 &&
            selected[selected.length - 1].get('id') != this.getStore('accessTemplateContentsStore').last().get('id'));
        },
        
    writeAccessTemplateContentsStore: function(store,operation) {
        store.getProxy().setExtraParam('parentId',this.getViewModel().data.currentAccessTemplate.id);
        },
        
    loadAccessTemplateContentsStoreAndSyncPanels: function(selectedId) {
        var fromGridRef = this.lookupReference('fromGridRef');
        var toGridRef = this.lookupReference('toGridRef');
        
        fromGridRef.setSelection();
        toGridRef.setSelection();
        
        this.getStore('accessTemplateContentsStore').getProxy().setExtraParam('parentId',selectedId);
        this.getStore('accessTemplateContentsStore').load({
            callback: function() {
                fromGridRef.setBind({
                    store: '{urlListStore}'
                    });
                }
            });
        },
        
    onUrlListStoreLoad: function(store) {
        this.loadAccessTemplateContentsStoreAndSyncPanels(this.getViewModel().data.currentAccessTemplate.id);        
        store.sort('name','ASC');
        },

    onSaveAccessTemplateContentsClick: function() {
        var thisController = this;
        
        if (this.getViewModel().data.currentAccessTemplate.dirty) {
            var isNameModified = this.getViewModel().data.currentAccessTemplate.isModified('name');
            
            this.getViewModel().data.currentAccessTemplate.save({
                callback: function() {
                    if (isNameModified) {
                        thisController.fireEvent('onAccessTemplateReloadRequest');
                        }
                    }
                })
            }
            
        var store = this.getStore('accessTemplateContentsStore');
        
        store.sync({
            failure: function(batch,options) {
                Ext.MessageBox.show({
                    title: 'Ошибка синхронизации с сервером',
                    message: 'При синхронизации с сервером возникла непредвиденная ошибка. Перезагрузить список с сервера?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.MessageBox.ERROR,
                    
                    fn: function(btn) {
                        if (btn == 'yes') {
                            store.load();
                            this.lookupReference('fromGridRef').setSelection();
                            this.lookupReference('toGridRef').setSelection();
                            }
                        }
                    });
                }
            });
        },
        
    onRevertAccessTemplateContentsClick: function() {
        this.getViewModel().data.currentAccessTemplate.reject();
        this.getStore('accessTemplateContentsStore').rejectChanges();
        },
        
    onUpClick: function() {
        var selectedRecord = this.lookupReference('toGridRef').getSelection()[0];
        var storeRecordCount = this.getStore('accessTemplateContentsStore').getCount();
        
        if (!selectedRecord) {
            return;
            }
            
        var recordToSwapWith = 
            this.getStore('accessTemplateContentsStore').findRecord('orderNumber',selectedRecord.get('orderNumber') - 1);
            
        if (!recordToSwapWith) {
            return;
            }
            
        selectedRecord.set('orderNumber',recordToSwapWith.get('orderNumber'));
               
        if (selectedRecord.get('orderNumber') == 1) {
            this.getViewModel().set('canMoveUp',false);
            }
            
        if (selectedRecord.get('orderNumber') < storeRecordCount && storeRecordCount > 1) {
            this.getViewModel().set('canMoveDown',true);
            }
            
        recordToSwapWith.set('orderNumber',recordToSwapWith.get('orderNumber') + 1);
        
        this.getStore('accessTemplateContentsStore').sort('orderNumber','ASC');
        },
        
    onDownClick: function() {
        var selectedRecord = this.lookupReference('toGridRef').getSelection()[0];
        var storeRecordCount = this.getStore('accessTemplateContentsStore').getCount();
        
        if (!selectedRecord) {
            return;
            }
            
        var recordToSwapWith = 
            this.getStore('accessTemplateContentsStore').findRecord('orderNumber',selectedRecord.get('orderNumber') + 1);
            
        if (!recordToSwapWith) {
            return;
            }
            
        selectedRecord.set('orderNumber',recordToSwapWith.get('orderNumber'));        
        
        if (selectedRecord.get('orderNumber') == storeRecordCount) {
            this.getViewModel().set('canMoveDown',false);
            }
            
        if (selectedRecord.get('orderNumber') > 1 && storeRecordCount > 1) {
            this.getViewModel().set('canMoveUp',true);
            }
            
        recordToSwapWith.set('orderNumber',recordToSwapWith.get('orderNumber') - 1);
        
        this.getStore('accessTemplateContentsStore').sort('orderNumber','ASC');
        },
        
    onAddClick: function() {
        var selection = this.lookupReference('fromGridRef').getSelection();
        
        if (selection.length == 0) {
            return;
            }
        
        this.getStore('accessTemplateContentsStore').add({
            urlListId: selection[0].get('id'),
            orderNumber: this.getStore('accessTemplateContentsStore').getCount() + 1
            });
            
        this.lookupReference('fromGridRef').setSelection();
        },
        
    onRemoveClick: function() {
        var selection = this.lookupReference('toGridRef').getSelection();
        
        this.getStore('accessTemplateContentsStore').remove(selection);
        },
        
    renderUrlListName: function(value,metaData,record) {
        var recordFound = this.getStore('urlListStore').getById(record.get('urlListId'));
        
        if (recordFound) {
            return recordFound.get('name');
            }
        },
        
    renderUrlListWhitelist: function(value,metaData,record) {
        var recordFound = this.getStore('urlListStore').getById(record.get('urlListId'));
        
        if (recordFound) {
            return recordFound.get('whitelist') ? '✓' : '';
            }
        }
    })