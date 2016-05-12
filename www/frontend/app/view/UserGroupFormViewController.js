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

        this.fireEvent('onTreeSelectionChange', {selected: args.selected})
        },
        
    onUserGroupSelect: function(selectedId) {
        var userGroupFormViewMembersTab = this.lookupReference('userGroupFormViewMembersTab');
        var groupMembersStore = userGroupFormViewMembersTab.getViewModel().getStore('groupMembersStore');
        var accessTemplatesStore = userGroupFormViewMembersTab.getViewModel().getStore('accessTemplatesStore');
        var hideTabs = this.getViewModel().get('myPermissionsStore').findExact('permissionName', 'ViewUsers') == -1;
            
        this.getViewModel().set('selectedGroupId', selectedId);
        
        this.getView().setActiveTab(0);
        
        for (i = 1; i < this.getView().getTabBar().items.getCount(); i++) {
            if (hideTabs)
                this.getView().getTabBar().items.getAt(i).hide();
            else
                this.getView().getTabBar().items.getAt(i).show();
            }
         
        //setting the default field values and clean up stores
        var today = new Date();

        //userReportTrafficByHosts
        this.lookupReference('userReportTrafficByHostsDateBegRef').setValue(
            new Date(today.getFullYear(), today.getMonth(), 1));

        this.lookupReference('userReportTrafficByHostsDateEndRef').setValue(
            new Date(today.getFullYear(), today.getMonth() + 1, 0));

        this.lookupReference('userReportTrafficByHostsGridRef').getStore().removeAll();

        //userReportTrafficByDates
        this.lookupReference('userReportTrafficByDatesDateBegRef').setValue(
            new Date(today.getFullYear(), today.getMonth(), 1));

        this.lookupReference('userReportTrafficByDatesDateEndRef').setValue(
            new Date(today.getFullYear(), today.getMonth() + 1, 0));

        this.lookupReference('userReportTrafficByDatesGridRef').getStore().removeAll();

        //userReportDateTraffic
        this.lookupReference('userReportDayTrafficDateRef').setValue(today);

        this.lookupReference('userReportDayTrafficGridRef').getStore().removeAll();
        this.lookupReference('userReportDayTrafficGridRef').getStore().selectedPage = 1;

        this.lookupReference('userReportDayTrafficGridTbarRef').onLoad(); //Reset paging toolbar
        
        //userGroupReportTrafficByUsers
        this.lookupReference('userGroupReportTrafficByUsersDateBegRef').setValue(
            new Date(today.getFullYear(), today.getMonth(), 1));

        this.lookupReference('userGroupReportTrafficByUsersDateEndRef').setValue(
            new Date(today.getFullYear(), today.getMonth() + 1, 0));

        this.lookupReference('userGroupReportTrafficByUsersGridRef').getStore().removeAll();
        
        //Start load chain
        if (this.getViewModel().get('myPermissionsStore').findExact('permissionName', 'ViewUsers') != -1) {
            accessTemplatesStore.load();
            }
        else {
            groupMembersStore.load();
            }
        },
        
    onGroupMembersStoreLoad: function() {
        var userGroupFormViewMembersTab = this.lookupReference('userGroupFormViewMembersTab');
        var groupMembersStore = userGroupFormViewMembersTab.getViewModel().getStore('groupMembersStore');
        var accessTemplatesStore = userGroupFormViewMembersTab.getViewModel().getStore('accessTemplatesStore');
        var userStatusesStore = userGroupFormViewMembersTab.getViewModel().getStore('userStatusesStore');
        var authMethodsStore = userGroupFormViewMembersTab.getViewModel().getStore('authMethodsStore');
        var rolesStore = userGroupFormViewMembersTab.getViewModel().getStore('rolesStore');
        
        groupMembersStore.each(function(item) {
            if (item.data['accessTemplateName'] == '') {                
                var recordFound = accessTemplatesStore.getById(item.get('accessTemplateId'));

                if (recordFound) {
                    item.set('accessTemplateName', recordFound.get('name'));
                    }
                }
                
            if (item.data['statusName'] == '') {
                var recordFound = userStatusesStore.getById(item.get('status'));

                if (recordFound) {
                    item.set('statusName', recordFound.get('name'));
                    }
                }

            if (item.data['authMethodName'] == '') {
                var recordFound = authMethodsStore.getById(item.get('authMethod'));

                if (recordFound) {
                    item.set('authMethodName', recordFound.get('name'));
                    }
                }

            if (item.data['roleName'] == '') {
                var recordFound = rolesStore.getById(item.get('roleId'));

                if (recordFound) {
                    item.set('roleName', recordFound.get('name'));
                    }
                }
            });
        },
        
    onAccessTemplatesStoreLoad: function() {
        var userGroupFormViewMembersTab = this.lookupReference('userGroupFormViewMembersTab');
        var rolesStore = userGroupFormViewMembersTab.getViewModel().getStore('rolesStore');
        
        rolesStore.load();
        },
        
    onRolesStoreLoad: function() {
        var userGroupFormViewMembersTab = this.lookupReference('userGroupFormViewMembersTab');
        var groupMembersStore = userGroupFormViewMembersTab.getViewModel().getStore('groupMembersStore');
        
        groupMembersStore.load();
        },
        
    onShowUserReportTrafficByHostsClick: function() {
        var grid = this.lookupReference('userReportTrafficByHostsGridRef');
        var gridStore = grid.getStore();

        gridStore.load({
            callback: function(records, operation, success) {
                if (success)
                    grid.getView().setScrollY(0);
                else
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (operation.error && operation.error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                }
            });
        },

    onShowUserReportTrafficByDatesClick: function() {
        var grid = this.lookupReference('userReportTrafficByDatesGridRef');
        var gridStore = grid.getStore();

        gridStore.load({
            callback: function(records, operation, success) {
                if (success)
                    grid.getView().setScrollY(0);
                else
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (operation.error && operation.error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                }
            });
        },

    onShowUserReportDayTrafficClick: function() {
        var grid = this.lookupReference('userReportDayTrafficGridRef');
        var gridStore = grid.getStore();

        gridStore.selectedPage = 1;

        gridStore.load({
            callback: function(records, operation, success) {
                if (success)
                    grid.getView().setScrollY(0);
                else
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (operation.error && operation.error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                }
            });
        },
        
    onShowUserGroupReportTrafficByUsersClick: function() {
        var grid = this.lookupReference('userGroupReportTrafficByUsersGridRef');
        var gridStore = grid.getStore();

        gridStore.load({
            callback: function(records, operation, success) {
                if (success)
                    grid.getView().setScrollY(0);
                else
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: (operation.error && operation.error.status == 403) ?
                            'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                }
            });
        },
        
    beforeLoadGroupMembersStore: function(store) {
        store.getProxy().setExtraParam('userGroupId', this.getViewModel().get('selectedGroupId'));
        },
        
    beforeLoadUserReportTrafficByHostsGridStore: function(store) {
        store.getProxy().url = '/rest/reports/group-traffic-by-hosts';
        
        store.getProxy().setExtraParams({
            'groupId': this.getViewModel().data.selectedGroupId,
            'dateBeg': this.lookupReference('userReportTrafficByHostsDateBegRef').getValue(),
            'dateEnd': this.lookupReference('userReportTrafficByHostsDateEndRef').getValue(),
            'limit': this.lookupReference('userReportTrafficByHostsLimitRef').getValue()
            });
        },

    beforeLoadUserReportTrafficByDatesGridStore: function(store) {
        store.getProxy().url = '/rest/reports/group-traffic-by-dates';
        
        store.getProxy().setExtraParams({
            'groupId': this.getViewModel().data.selectedGroupId,
            'dateBeg': this.lookupReference('userReportTrafficByDatesDateBegRef').getValue(),
            'dateEnd': this.lookupReference('userReportTrafficByDatesDateEndRef').getValue()
            });
        },

    beforeLoadUserReportDayTrafficGridStore: function(store) {
        store.getProxy().url = '/rest/reports/group-day-traffic';
        
        store.getProxy().setExtraParams({
            'groupId': this.getViewModel().data.selectedGroupId,
            'date': this.lookupReference('userReportDayTrafficDateRef').getValue()
            });
        },
        
    beforeLoadUserGroupReportTrafficByUsersGridStore: function(store) {
        store.getProxy().setExtraParams({
            'groupId': this.getViewModel().data.selectedGroupId,
            'dateBeg': this.lookupReference('userGroupReportTrafficByUsersDateBegRef').getValue(),
            'dateEnd': this.lookupReference('userGroupReportTrafficByUsersDateEndRef').getValue(),
            'limit': this.lookupReference('userGroupReportTrafficByUsersLimitRef').getValue()
            });
        }
    })