Ext.define('tentacles.view.UrlMasksFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.urlmasksformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onUrlListSelect: 'onUrlListSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        if (this.getViewModel().get('urlListRecordAndStoreStatus').dirty) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'yes') {
                        this.onSaveUrlMaskClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onUrlMaskStoreLoad: function(store) {
        store.sort('name', 'ASC');
        },
        
    onUrlMaskStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onUrlMaskStoreUpdate: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onUrlListSelect: function(selectedId) {        
        this.getViewModel().linkTo('selectedUrlList', {reference: 'UrlListModel', id: selectedId});
        this.getStore('urlMaskStore').getProxy().setExtraParam('parentId', selectedId);
        this.getStore('urlMaskStore').load();
        },
        
    writeUrlMaskStore: function(store, operation) {
        store.getProxy().setExtraParam('parentId', this.getViewModel().data.selectedUrlList.id);
        },
        
    onUrlMaskGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty', this.lookupReference('urlMaskGridRef').getSelection().length == 0);
        },
        
    onAddUrlMaskClick: function() {
        var urlMaskStore = this.getStore('urlMaskStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите выражение маски URL:',
            function(btn, text) {
                trimmedText = text.trim();

                if (btn == 'ok' && trimmedText != '') {
                    if (urlMaskStore.find('name', trimmedText) == -1) {
                        urlMaskStore.add({name: trimmedText});
                        urlMaskStore.sort('name', 'ASC');
                        }
                    }
                });
        },
        
    onEditUrlMaskClick: function() {
        var selection = this.lookupReference('urlMaskGridRef').getSelection()[0];
        var urlMaskStore = this.getStore('urlMaskStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите выражение маски URL:',
            function(btn, text) {
                trimmedText = text.trim();

                if (btn == 'ok' && trimmedText != '') {
                    urlMaskStore.getById(selection.get('id')).set('name', trimmedText);
                    urlMaskStore.sort('name', 'ASC');
                    }
                }, undefined, undefined, selection.get('name'));
        },
        
    onRemoveUrlMaskClick: function() {
        var selection = this.lookupReference('urlMaskGridRef').getSelection();
        
        this.getStore('urlMaskStore').remove(selection); 
        },

    onSaveUrlMaskClick: function() {
        var thisController = this;
        
        if (this.getViewModel().data.selectedUrlList.dirty) {
            var isModified = this.getViewModel().data.selectedUrlList.dirty;
            
            this.getViewModel().data.selectedUrlList.save({
                failure: function(record, operation) {
                    thisController.getViewModel().data.selectedUrlList.reject();
                        
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (batch.exceptions[0].error && batch.exceptions[0].error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    },

                callback: function() {
                    if (isModified) {
                        thisController.fireEvent('onUrlListReloadRequest');
                        }
                    }
                })
            }
        
        var store = this.getStore('urlMaskStore');
        
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
        
    onRevertUrlMaskClick: function() {
        this.getViewModel().data.selectedUrlList.reject();
        this.getStore('urlMaskStore').rejectChanges();
        }
    })