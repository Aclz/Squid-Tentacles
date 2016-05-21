Ext.define('tentacles.view.RolePermissionsFormViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.rolepermissionsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onRoleSelect: 'onRoleSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        if (this.getViewModel().get('roleRecordAndStoreStatus').dirtyAndValid) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.YESNO,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'yes') {
                        this.onSaveRolePermissionsClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },
        
    onPermissionsStoreLoad: function(store) {
        this.getStore('rolePermissionsStore').load();
        },
        
    onRolePermissionsStoreLoad: function(store) {
        var permissionId, permissionName, permissionDescription;

        var perimssionsStore = this.getStore('permissionsStore');
        var rolePermissionsStore = this.getStore('rolePermissionsStore');
        var gridStore = this.getStore('gridStore');

        gridStore.removeAll();

        perimssionsStore.each(function(item) {
            permissionId = item.get('id');
            permissionName = item.get('name');

            switch (permissionName) {
                case 'ViewPermissions':
                    permissionDescription = 'Права доступа: просмотр';
                    break;
                case 'EditPermissions':
                    permissionDescription = 'Права доступа: редактирование';
                    break;
                case 'ViewSettings':
                    permissionDescription = 'Настройки системы: просмотр';
                    break;
                case 'EditSettings':
                    permissionDescription = 'Настройки системы: редактирование';
                    break;
                case 'ViewUsers':
                    permissionDescription = 'Cвойства пользователей: просмотр';
                    break;
                case 'EditUsers':
                    permissionDescription = 'Cвойства пользователей: редактирование';
                    break;
                default:
                    permissionDescription = 'Неизвестная привилегия!';
                };

            rolePermissionIndex = rolePermissionsStore.findExact('permissionId', permissionId);

            gridStore.add({
                'permissionName': permissionName,
                'permissionDescription': permissionDescription,
                'permissionAllowed': rolePermissionIndex == -1 ? false : true
                });
            });
            
        gridStore.sort('permissionDescription', 'ASC');
        },
        
    onRolePermissionsStoreDataChanged: function(store) {
        this.getViewModel().set('storeIsDirty', (store.getModifiedRecords().length + store.getRemovedRecords().length > 0));
        },
        
    onRoleSelect: function(selectedId) {
        this.getViewModel().linkTo('selectedRole', {reference: 'RoleModel', id: selectedId});
        this.getStore('rolePermissionsStore').getProxy().setExtraParam('parentId', selectedId);
        this.getStore('permissionsStore').load();
        },
        
    onGridStoreUpdate: function(store) {
        var permissionId, permissionName, permissionDescription, permissionIndex, rolePermissionIndex, rolePermissionItem;
        var removedRolePermissionRecord;
        
        var perimssionsStore = this.getStore('permissionsStore');
        var rolePermissionsStore = this.getStore('rolePermissionsStore');
        
        store.each(function(item) {
            permissionName = item.get('permissionName');
            permissionAllowed = item.get('permissionAllowed');
            
            permissionIndex = perimssionsStore.findExact('name', permissionName);
            
            if (permissionIndex == -1) {
                console.log('Unexpected permission search result!');
                return;
                }
                
            permissionId = perimssionsStore.getAt(permissionIndex).get('id');
                
            rolePermissionIndex = rolePermissionsStore.findExact('permissionId', permissionId);
            
            if (permissionAllowed) {
                if (rolePermissionIndex == -1) {    
                    removedRolePermissionRecord = rolePermissionsStore.getRemovedRecords().find(function(item) {
                        return (item.get('permissionId') == permissionId);
                        });
                        
                    if (removedRolePermissionRecord == undefined) {
                        rolePermissionsStore.add({'permissionId': permissionId});
                        }
                    else {
                        rolePermissionsStore.add(removedRolePermissionRecord);
                        }
                    }
                }
            else {
                if (rolePermissionIndex != -1) {
                    rolePermissionsStore.remove(rolePermissionsStore.getAt(rolePermissionIndex));
                    }
                }
            });
        },

    onSaveRolePermissionsClick: function() {
        var thisController = this;
        var selectedRole = this.getViewModel().data.selectedRole;
        
        if (selectedRole.dirty) {
            selectedRole.save({
                failure: function(record, operation) {
                    selectedRole.reject();

                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (batch.exceptions[0].error && batch.exceptions[0].error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    },

                success: function() {
                    treeItem = thisController.getViewModel().get('mainTreeStore').getById("role_" + selectedRole.id);
                    
                    if (treeItem != undefined) {
                        treeItem.set({
                            'text': selectedRole.get('name')
                            });
                        }
                    }
                })
            }

        var store = this.getStore('rolePermissionsStore');
        
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
                thisController.fireEvent('onRolePermissionsReloadRequest');
                }
            });
        },
        
    onRevertRolePermissionsClick: function() {
        var rolePermissionsStore = this.getStore('rolePermissionsStore');
        
        this.getViewModel().data.selectedRole.reject();
        rolePermissionsStore.rejectChanges();
        this.onRolePermissionsStoreLoad(rolePermissionsStore);
        }
    })