Ext.define('tentacles.view.RolesFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.rolesformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onRolesSelect: 'onRolesSelect',
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
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'ok') {
                        thisController.onSaveRoleClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onRoleStoreLoad: function(store) {
        store.sort('name', 'ASC');
        },
        
    onRoleStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onRolesSelect: function(selectedId) {
        this.getViewModel().linkTo('settings', {reference: 'SettingsModel', id: 1});
        this.getStore('roleStore').load();
        },
        
    onRoleGridSelectionChange: function() {
        this.getViewModel().set('gridSelectionEmpty', this.lookupReference('roleGridRef').getSelection().length == 0);
        },
        
    onAddRoleClick: function() {
        var roleStore = this.getStore('roleStore');
        
        Ext.MessageBox.prompt('Введите значение', 'Введите название роли:',
            function(btn, text) {
                trimmedText = text.trim();
                
                if (btn == 'ok' && trimmedText != '') {
                    if (roleStore.find('name', trimmedText) == -1) {                   
                        roleStore.add({name: trimmedText});
                        roleStore.sort('name', 'ASC');
                        }
                    }
                }
            );
        },
        
    onRemoveRoleClick: function() {
        var selection = this.lookupReference('roleGridRef').getSelection();
        this.getStore('roleStore').remove(selection); 
        },

    onSaveRoleClick: function() {
        var thisController = this;
        var store = this.getStore('roleStore');
        
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
                thisController.fireEvent('onRoleReloadRequest');
                }
            });
        },
        
    onRevertRoleClick: function() {
        var roleStore = this.getStore('roleStore');

        this.getViewModel().data.settings.reject();
        roleStore.rejectChanges();
        this.onRoleStoreLoad(roleStore);
        }
    })