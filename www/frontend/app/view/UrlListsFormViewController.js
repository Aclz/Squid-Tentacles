Ext.define('tentacles.view.UrlListsFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.urllistsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onUrlListsSelect: 'onUrlListsSelect',
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
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'yes') {
                        this.onSaveUrlListClick();
                        }
                        
                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onUrlListStoreLoad: function(store) {
        store.sort('name', 'ASC');
        },
        
    onUrlListStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onUrlListsSelect: function(selectedId) {
        this.getStore('urlListStore').load();
        },
        
    onUrlListGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty', this.lookupReference('urlListGridRef').getSelection().length == 0);
        },
        
    onAddUrlListClick: function() {
        var urlListStore = this.getStore('urlListStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите название списка URL:',
            function(btn, text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (urlListStore.find('name', trimmedText) == -1) {                   
                        urlListStore.add({name: trimmedText});
                        urlListStore.sort('name', 'ASC');
                        }
                    }
                }
            );
        },
        
    onRemoveUrlListClick: function() {
        var selection = this.lookupReference('urlListGridRef').getSelection();
        this.getStore('urlListStore').remove(selection); 
        },

    onSaveUrlListClick: function() { 
        var store = this.getStore('urlListStore');
        var thisController = this;
        
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
                },
                
            callback: function() {
                thisController.fireEvent('onUrlListReloadRequest');
                }
            });
        },
        
    onRevertUrlListClick: function() {
        this.getStore('urlListStore').rejectChanges();
        }
    })