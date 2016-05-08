Ext.define('tentacles.view.UserGroupFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.usergroupformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onUserGroupSelect: 'onUserGroupSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
            
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        this.fireEvent('onTreeSelectionChange', {selected: args.selected});
        },
        
    onUserGroupSelect: function(selectedId) {
        this.getStore('groupUsersStore').getProxy().setExtraParam('userGroupId', selectedId);
        
        if (this.getViewModel().get('myPermissionsStore').findExact('permissionName', 'ViewUsers') != -1) {
            this.getStore('accessTemplatesStore').load();
            }
        else {
            this.getStore('groupUsersStore').load();
            }
        },
        
    onGroupUserStoreLoad: function() {
        var thisController = this;
        
        this.getStore('groupUsersStore').each(function(item) {
            if (item.data['accessTemplateName'] == '') {                
                var recordFound = thisController.getStore('accessTemplatesStore').getById(item.get('accessTemplateId'));

                if (recordFound) {
                    item.set('accessTemplateName', recordFound.get('name'));
                    }
                }
                
            if (item.data['statusName'] == '') {
                var recordFound = thisController.getStore('userStatusesStore').getById(item.get('status'));

                if (recordFound) {
                    item.set('statusName', recordFound.get('name'));
                    }
                }

            if (item.data['authMethodName'] == '') {
                var recordFound = thisController.getStore('authMethodsStore').getById(item.get('authMethod'));

                if (recordFound) {
                    item.set('authMethodName', recordFound.get('name'));
                    }
                }

            if (item.data['roleName'] == '') {
                var recordFound = thisController.getStore('rolesStore').getById(item.get('roleId'));

                if (recordFound) {
                    item.set('roleName', recordFound.get('name'));
                    }
                }
            });
        },
        
    onAccessTemplatesStoreLoad: function() {
        this.getStore('rolesStore').load();
        },
        
    onRolesStoreLoad: function() {
        this.getStore('groupUsersStore').load();
        }
    })