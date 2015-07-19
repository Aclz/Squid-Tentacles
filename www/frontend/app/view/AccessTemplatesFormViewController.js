Ext.define('tentacles.view.AccessTemplatesFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.accesstemplatesformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onAccessTemplatesSelect: 'onAccessTemplatesSelect',
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
        
    onAccessTemplateStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty',(store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onAccessTemplatesSelect: function(selectedId) {
        this.getStore('accessTemplateStore').load();
        },
        
    onAccessTemplateGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty',this.lookupReference('accessTemplateGridRef').getSelection().length == 0);
        },
        
    onAddAccessTemplateClick: function() {
        var accessTemplateStore = this.getStore('accessTemplateStore');
        
        Ext.MessageBox.prompt('Введите значение','Введите название шаблона доступа:',
            function(btn,text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (accessTemplateStore.find('name',trimmedText) == -1) {                   
                        accessTemplateStore.add({name:trimmedText});
                        accessTemplateStore.sort('name','ASC');
                        }
                    }
                }
            );
        },
        
    onRemoveAccessTemplateClick: function() {
        var selection = this.lookupReference('accessTemplateGridRef').getSelection();
        this.getStore('accessTemplateStore').remove(selection); 
        },

    onSaveAccessTemplateClick: function() {
        var store = this.getStore('accessTemplateStore');
        var thisController = this;
        
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
                },
                
            callback: function() {
                thisController.fireEvent('onAccessTemplateReloadRequest');
                }
            });
        },
        
    onRevertAccessTemplateClick: function() {
        this.getStore('accessTemplateStore').rejectChanges();
        }
    })