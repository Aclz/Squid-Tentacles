Ext.define('tentacles.view.UserFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onUserSelect: 'onUserSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }
            
        var selectedUser = this.getViewModel().data.selectedUser;
            
        if (selectedUser.dirty && selectedUser.isValid()) {
            Ext.MessageBox.show({
                title: 'Есть несохраненные данные',
                message: 'Несохраненные данные будут потеряны! Сохранить?',
                buttons: Ext.Msg.OKCANCEL,
                icon: Ext.MessageBox.WARNING,
                scope: this,

                fn: function(btn) {
                    if (btn == 'ok') {
                        this.onSaveUserClick();
                        }

                    this.fireEvent('onTreeSelectionChange', {selected: args.selected});
                    }
                });
            }
        else {
            this.fireEvent('onTreeSelectionChange', {selected: args.selected});
            }
        },

    onUserSelect: function(selectedId) {
        var hideTabs = (selectedId != this.getViewModel().get('loggedInUser.id')) &&
            (this.getViewModel().get('myPermissionsStore').findExact('permissionName', 'ViewUsers') == -1);
        
        this.getViewModel().linkTo('selectedUser', {reference: 'UserModel', id: selectedId});
        
        this.getView().setActiveTab(0);
        
        for (i = 1; i < this.getView().getTabBar().items.getCount(); i++)
            if (hideTabs)
                this.getView().getTabBar().items.getAt(i).hide();
            else
                this.getView().getTabBar().items.getAt(i).show();

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
        },

    onSaveUserClick: function() {
        var thisController = this;
        
        this.getViewModel().data.selectedUser.save({
            failure: function(record, operation) {
                thisController.getViewModel().data.selectedUser.reject();
            
                Ext.MessageBox.show({
                    title: 'Ошибка',
                    message: (operation.error && operation.error.status == 403) ?
                        'Недостаточно прав доступа!' : 'Ошибка совершения операции.',
                    buttons: Ext.Msg.OK,
                    icon: Ext.MessageBox.ERROR
                    });
                }
            })
        },

    onRevertUserClick: function() {
        this.getViewModel().data.selectedUser.reject();
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
        
    beforeLoadUserReportTrafficByHostsGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId': this.getViewModel().data.selectedUser.id,
            'dateBeg': this.lookupReference('userReportTrafficByHostsDateBegRef').getValue(),
            'dateEnd': this.lookupReference('userReportTrafficByHostsDateEndRef').getValue(),
            'limit': this.lookupReference('userReportTrafficByHostsLimitRef').getValue()
            });
        },

    beforeLoadUserReportTrafficByDatesGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId': this.getViewModel().data.selectedUser.id,
            'dateBeg': this.lookupReference('userReportTrafficByDatesDateBegRef').getValue(),
            'dateEnd': this.lookupReference('userReportTrafficByDatesDateEndRef').getValue()
            });
        },

    beforeLoadUserReportDayTrafficGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId': this.getViewModel().data.selectedUser.id,
            'date': this.lookupReference('userReportDayTrafficDateRef').getValue()
            });
        }
    })