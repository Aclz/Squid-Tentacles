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

        if (this.getViewModel().get('storeIsDirty')) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'ok') {
                        this.onSaveUrlMaskClick();
                        }

                    this.fireEvent('onTreeSelectionChange',{selected:args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange',{selected:args.selected});
            }
        },
        
    onUrlStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty',(store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onUrlListSelect: function(selectedId) {
        this.getViewModel().data.currentUrlListId = selectedId
        this.getStore('urlMaskStore').load();
        },
    
    beforeLoadUrlMaskStore: function(store,operation) {
        store.getProxy().setExtraParam('parentId',this.getViewModel().data.currentUrlListId);
        },
        
    writeUrlMaskStore: function(store,operation) {
        store.getProxy().setExtraParam('parentId',this.getViewModel().data.currentUrlListId);
        },
        
    onUrlMaskGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty',this.lookupReference('urlMaskGridRef').getSelection().length == 0);
        },
        
    onAddUrlMaskClick: function() {
        var urlMaskStore = this.getStore('urlMaskStore');
        
        Ext.MessageBox.prompt('Введите значение','Введите выражение маски URL:',
            function(btn,text) {
                trimmedText = text.trim();

                if (btn == 'ok' && trimmedText != '') {
                    if (urlMaskStore.find('name',trimmedText) == -1) {
                        urlMaskStore.add({name:trimmedText});
                        urlMaskStore.sort('name','ASC');
                        }
                    }
                });
        },
        
    onRemoveUrlMaskClick: function() {
        var selection = this.lookupReference('urlMaskGridRef').getSelection();
        this.getStore('urlMaskStore').remove(selection); 
        },

    onSaveUrlMaskClick: function() {
        var store = this.getStore('urlMaskStore');
        
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
        
    onRevertUrlMaskClick: function() {
        this.getStore('urlMaskStore').rejectChanges();
        }
    })