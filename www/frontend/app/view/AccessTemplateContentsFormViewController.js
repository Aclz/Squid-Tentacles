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
                        this.onSaveAccessTemplateClick();
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
        },
        
    onAccessTemplateContentsSelect: function(selectedId) {
        this.getViewModel().linkTo('currentAccessTemplate',{reference: 'AccessTemplateModel',id: selectedId});
        this.getStore('accessTemplateContentsStore').getProxy().setExtraParam('parentId',selectedId);
        this.getStore('accessTemplateContentsStore').load();
        },
        
    writeAccessTemplateContentsStore: function(store,operation) {
        store.getProxy().setExtraParam('parentId',this.getViewModel().data.currentAccessTemplate.id);
        },
        
    onAccessTemplateGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty',this.lookupReference('accessTemplateGridRef').getSelection().length == 0);
        },
        
    onAddAccessTemplateContentsClick: function() {
        },
        
    onRemoveAccessTemplateContentsClick: function() {
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
                            }
                        }
                    });
                }
            });
        },
        
    onRevertAccessTemplateContentsClick: function() {
        this.getViewModel().data.currentAccessTemplate.reject();
        this.getStore('accessTemplateContentsStore').rejectChanges();
        }
    })