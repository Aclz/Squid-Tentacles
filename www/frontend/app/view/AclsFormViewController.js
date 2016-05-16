Ext.define('tentacles.view.AclsFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.aclsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onAclsSelect: 'onAclsSelect',
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
                        thisController.onSaveAclClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onAclStoreLoad: function(store) {
        store.sort('name', 'ASC');
        },
        
    onAclStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onAclsSelect: function(selectedId) {
        this.getViewModel().linkTo('settings', {reference: 'SettingsModel', id: 1});
        this.getStore('aclStore').load();
        },
        
    onAclGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty', this.lookupReference('aclGridRef').getSelection().length == 0);
        },
        
    onAddAclClick: function() {
        var aclStore = this.getStore('aclStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите название списка доступа:',
            function(btn, text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (aclStore.find('name', trimmedText) == -1) {                   
                        aclStore.add({name: trimmedText});
                        aclStore.sort('name', 'ASC');
                        }
                    }
                }
            );
        },
        
    onRemoveAclClick: function() {
        var selection = this.lookupReference('aclGridRef').getSelection();
        this.getStore('aclStore').remove(selection); 
        },

    onSaveAclClick: function() {
        var thisController = this;
        var store = this.getStore('aclStore');
        
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
                thisController.fireEvent('onAclReloadRequest');
                }
            });
        },
        
    onRevertAclClick: function() {
        var aclStore = this.getStore('aclStore');

        this.getViewModel().data.settings.reject();
        aclStore.rejectChanges();
        this.onAclStoreLoad(aclStore);
        }
    })