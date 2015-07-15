Ext.define('tentacles.view.UrlListsFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.urllistsformviewcontroller',
    
    listen: {
        controller: {
            '*': {
                onUrlListsSelect: 'onUrlListsSelect'
                }
            }
        },
        
    onUrlListStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty',(store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onUrlListsSelect: function(selectedId) {
        this.getViewModel().getStore('urlListStore').load();
        },
        
    onUrlListGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty',this.lookupReference('urlListGridRef').getSelection().length == 0);
        },
        
    onAddUrlListClick: function() {
        var urlListStore = this.getViewModel().getStore('urlListStore');
        
        Ext.MessageBox.prompt('Введите значение','Введите название списка URL:',
            function(btn,text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (urlListStore.find('name',trimmedText) == -1) {                   
                        urlListStore.add({name:trimmedText});
                        urlListStore.sort('name','ASC');
                        }
                    }
                }
            );
        },
        
    onRemoveUrlListClick: function() {
        var selection = this.lookupReference('urlListGridRef').getSelection();
        this.getViewModel().getStore('urlListStore').remove(selection); 
        },

    onSaveUrlListClick: function() {
        var store = this.getViewModel().getStore('urlListStore');
        var thisViewController = this;
        
        store.sync({
            failure: function(batch,options) {
                Ext.MessageBox.show({
                    title: 'Ошибка синхронизации с сервером',
                    message: 'При синхронизации с сервером возникла непредвиденная ошибка. Перезагрузить список с сервера?',
                    buttons: Ext.Msg.YESNO,
                    icon: Ext.window.MessageBox.ERROR,
                    
                    fn: function(btn) {
                        if (btn == 'yes') {
                            store.load();
                            }
                        }
                    });
                },
                
            callback: function() {
                thisViewController.fireEvent('onUrlListReloadRequest');
                }
            });
        },
        
    onRevertUrlListClick: function() {
        this.getViewModel().getStore('urlListStore').rejectChanges();
        }
    })