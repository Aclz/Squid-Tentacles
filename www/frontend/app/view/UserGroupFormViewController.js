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

        this.fireEvent('onTreeSelectionChange',{selected:args.selected});
        },
        
    onUserGroupSelect: function(selectedId) {
        this.getStore('groupUsersStore').getProxy().setExtraParam('userGroupId',selectedId);
        
        if (this.getStore('accessTemplatesStore').isLoaded()) {
            this.getStore('groupUsersStore').load();
            }
        },
        
    onAccessTemplatesStoreLoad: function(selectedId) {
        this.getStore('groupUsersStore').load();
        },
        
    renderUserStatus: function(value,metaData,record) {
        var recordFound = this.getStore('userStatusesStore').getById(record.get('status'));

        if (recordFound) {
            return recordFound.get('name');
            }
        },
        
    renderUserAuthMethod: function(value,metaData,record) {
        var recordFound = this.getStore('authMethodsStore').getById(record.get('authMethod'));

        if (recordFound) {
            return recordFound.get('name');
            }
        },
        
    renderUserAccessTemplate: function(value,metaData,record) {
        var recordFound = this.getStore('accessTemplatesStore').getById(record.get('accessTemplateId'));

        if (recordFound) {
            return recordFound.get('name');
            }
        }
    })