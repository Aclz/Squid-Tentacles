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
        var thisController = this;
        
        if (!args.selected) {
            return;
            }

        if (this.getViewModel().get('settingsRecordAndStoreStatus').dirty) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'yes') {
                        thisController.onSaveAccessTemplateClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onAccessTemplateStoreLoad: function(store) {
        store.sort('name', 'ASC');
        },
        
    onAccessTemplateStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onAccessTemplatesSelect: function(selectedId) {
        this.getViewModel().linkTo('settings', {reference: 'SettingsModel', id: 1});
        this.getStore('accessTemplateStore').load();
        },
        
    onAccessTemplateGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty', this.lookupReference('accessTemplateGridRef').getSelection().length == 0);
        },
        
    onAddAccessTemplateClick: function() {
        var accessTemplateStore = this.getStore('accessTemplateStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите название шаблона доступа:',
            function(btn, text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (accessTemplateStore.find('name', trimmedText) == -1) {                   
                        accessTemplateStore.add({name: trimmedText});
                        accessTemplateStore.sort('name', 'ASC');
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
        var thisController = this;
        var store = this.getStore('accessTemplateStore');
        
        if (this.getViewModel().data.settings.dirty) {
            this.getViewModel().data.settings.save({
                failure: function(record, operation) {
                    thisController.getViewModel().data.settings.reject();

                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (operation.error && operation.error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    }
                })
            }
        
        store.sync({
            failure: function(batch, options) {
                store.rejectChanges();
                    
                Ext.MessageBox.show({
                    title: 'Ошибка',
                    message: (batch.exceptions[0].error && batch.exceptions[0].error.status == 403) ?
                        'Недостаточно прав доступа!' :
                        'Ошибка совершения операции. Возможно, попытка нарушения ссылочной целостности.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                    });
                },
                
            callback: function() {
                thisController.fireEvent('onAccessTemplateReloadRequest');
                }
            });
        },
        
    onRevertAccessTemplateClick: function() {
        var accessTemplateStore = this.getStore('accessTemplateStore');

        this.getViewModel().data.settings.reject();
        accessTemplateStore.rejectChanges();
        this.onAccessTemplateStoreLoad(accessTemplateStore);
        }
    })