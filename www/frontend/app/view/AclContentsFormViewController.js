Ext.define('tentacles.view.AclContentsFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.aclcontentsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onAclContentsSelect: 'onAclContentsSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        if (this.getViewModel().get('aclRecordAndStoreStatus').dirty) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'yes') {
                        this.onSaveAclContentsClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onAclContentsStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        
        var storeToIdArray = this.getStore('aclContentsStore').getData().getValues('urlListId', 'data');
        
        this.getStore('urlListStore').clearFilter();
        
        if (storeToIdArray.length != 0) {
            this.getStore('urlListStore').filterBy(function(record) {
                return storeToIdArray.indexOf(record.get('id')) == -1;
                });
            }
        },
        
    onAclContentsSelect: function(selectedId) {
        this.getViewModel().linkTo('selectedAcl', {reference: 'AclModel', id: selectedId});
        
        if (this.getStore('urlListStore').isLoaded()) {
            this.loadAclContentsStoreAndSyncPanels(selectedId);
            }
        },
        
    onFromGridSelectionChange: function(model, selected) {
        this.getViewModel().set('fromGridSelectionEmpty', selected.length == 0);
        },
        
    onToGridSelectionChange: function(model, selected) {
        this.getViewModel().set('toGridSelectionEmpty', selected.length == 0);
        
        this.getViewModel().set('canMoveUp', selected.length != 0 &&
            selected[0].get('id') != this.getStore('aclContentsStore').first().get('id'));
        
        this.getViewModel().set('canMoveDown', selected.length != 0 &&
            selected[selected.length - 1].get('id') != this.getStore('aclContentsStore').last().get('id'));
        },
        
    loadAclContentsStoreAndSyncPanels: function(selectedId) {
        var fromGridRef = this.lookupReference('fromGridRef');
        var toGridRef = this.lookupReference('toGridRef');
        
        fromGridRef.setSelection();
        toGridRef.setSelection();
        
        this.getStore('aclContentsStore').getProxy().setExtraParam('parentId', selectedId);
        
        this.getStore('aclContentsStore').load({
            callback: function() {
                fromGridRef.setBind({
                    store: '{urlListStore}'
                    });
                }
            });
        },
        
    onUrlListStoreLoad: function(store) {
        this.loadAclContentsStoreAndSyncPanels(this.getViewModel().data.selectedAcl.id);        
        store.sort('name', 'ASC');
        },

    onSaveAclContentsClick: function() {
        var thisController = this;
        
        if (this.getViewModel().data.selectedAcl.dirty) {
            var isNameModified = this.getViewModel().data.selectedAcl.isModified('name');
            
            this.getViewModel().data.selectedAcl.save({
                failure: function(record, operation) {                    
                    thisController.getViewModel().data.selectedAcl.reject();
                        
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (batch.exceptions[0].error && batch.exceptions[0].error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    },
                    
                callback: function() {
                    if (isNameModified) {
                        thisController.fireEvent('onAclReloadRequest');
                        }
                    }
                })
            }
            
        var store = this.getStore('aclContentsStore');
        
        store.sync({
            failure: function(batch, options) {
                store.rejectChanges();
                    
                Ext.MessageBox.show({
                    title: 'Ошибка',
                    message: (batch.exceptions[0].error && batch.exceptions[0].error.status == 403) ?
                        'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                    });
                }
            });
        },
        
    onRevertAclContentsClick: function() {
        this.getViewModel().data.selectedAcl.reject();
        this.getStore('aclContentsStore').rejectChanges();
        },
        
    onUpClick: function() {
        var selectedRecord = this.lookupReference('toGridRef').getSelection()[0];
        var storeRecordCount = this.getStore('aclContentsStore').getCount();
        
        if (!selectedRecord) {
            return;
            }
            
        var recordToSwapWith = 
            this.getStore('aclContentsStore').findRecord('orderNumber', selectedRecord.get('orderNumber') - 1);
            
        if (!recordToSwapWith) {
            return;
            }
            
        selectedRecord.set('orderNumber', recordToSwapWith.get('orderNumber'));
               
        if (selectedRecord.get('orderNumber') == 1) {
            this.getViewModel().set('canMoveUp', false);
            }
            
        if (selectedRecord.get('orderNumber') < storeRecordCount && storeRecordCount > 1) {
            this.getViewModel().set('canMoveDown', true);
            }
            
        recordToSwapWith.set('orderNumber', recordToSwapWith.get('orderNumber') + 1);
        
        this.getStore('aclContentsStore').sort('orderNumber', 'ASC');
        },
        
    onDownClick: function() {
        var selectedRecord = this.lookupReference('toGridRef').getSelection()[0];
        var storeRecordCount = this.getStore('aclContentsStore').getCount();
        
        if (!selectedRecord) {
            return;
            }
            
        var recordToSwapWith = 
            this.getStore('aclContentsStore').findRecord('orderNumber', selectedRecord.get('orderNumber') + 1);
            
        if (!recordToSwapWith) {
            return;
            }
            
        selectedRecord.set('orderNumber', recordToSwapWith.get('orderNumber'));        
        
        if (selectedRecord.get('orderNumber') == storeRecordCount) {
            this.getViewModel().set('canMoveDown', false);
            }
            
        if (selectedRecord.get('orderNumber') > 1 && storeRecordCount > 1) {
            this.getViewModel().set('canMoveUp', true);
            }
            
        recordToSwapWith.set('orderNumber', recordToSwapWith.get('orderNumber') - 1);
        
        this.getStore('aclContentsStore').sort('orderNumber', 'ASC');
        },
        
    onAddClick: function() {
        var selection = this.lookupReference('fromGridRef').getSelection();
        
        if (selection.length == 0) {
            return;
            }
        
        this.getStore('aclContentsStore').add({
            urlListId: selection[0].get('id'),
            orderNumber: this.getStore('aclContentsStore').getCount() + 1
            });
            
        this.lookupReference('fromGridRef').setSelection();
        },
        
    onRemoveClick: function() {
        var selection = this.lookupReference('toGridRef').getSelection();
        
        this.getStore('aclContentsStore').remove(selection);
        },
        
    renderUrlListName: function(value, metaData, record) {
        var recordFound = this.getStore('urlListStore').getById(record.get('urlListId'));
        
        if (recordFound) {
            return recordFound.get('name');
            }
        },
        
    renderUrlListWhitelist: function(value, metaData, record) {
        var recordFound = this.getStore('urlListStore').getById(record.get('urlListId'));
        
        if (recordFound) {
            return recordFound.get('whitelist') ? '✓' : '';
            }
        }
    })