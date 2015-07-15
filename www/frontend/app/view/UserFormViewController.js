Ext.define('tentacles.view.UserFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.userformviewcontroller',
    
    config: {
        listen: {
            controller: {
                '*': {
                    onUserSelect: 'onUserSelect'
                    }
                }
            }
        },

    onUserSelect: function(selectedId) {
        this.getViewModel().linkTo('currentUser',{reference:'UserModel',id:selectedId});
        this.getView().setActiveTab(0);

        //setting the default field values and clean up stores
        var today = new Date();

        //userReportTrafficByHosts
        this.lookupReference('userReportTrafficByHostsDateBegRef').setValue(
            new Date(today.getFullYear(),today.getMonth(), 1));

        this.lookupReference('userReportTrafficByHostsDateEndRef').setValue(
            new Date(today.getFullYear(),today.getMonth() + 1, 0));

        this.lookupReference('userReportTrafficByHostsGridRef').getStore().removeAll();

        //userReportTrafficByDates
        this.lookupReference('userReportTrafficByDatesDateBegRef').setValue(
            new Date(today.getFullYear(),today.getMonth(), 1));

        this.lookupReference('userReportTrafficByDatesDateEndRef').setValue(
            new Date(today.getFullYear(),today.getMonth() + 1, 0));

        this.lookupReference('userReportTrafficByDatesGridRef').getStore().removeAll();

        //userReportDateTraffic
        this.lookupReference('userReportDayTrafficDateRef').setValue(today);

        this.lookupReference('userReportDayTrafficGridRef').getStore().removeAll();
        this.lookupReference('userReportDayTrafficGridRef').getStore().currentPage = 1;

        this.lookupReference('userReportDayTrafficGridTbarRef').onLoad(); //Reset paging toolbar        
        },

    onSaveUserClick: function() {
        this.getViewModel().data.currentUser.save();
        },

    onRevertUserClick: function() {
        this.getViewModel().data.currentUser.reject();
        },

    onShowUserReportTrafficByHostsClick: function() {
        var grid = this.lookupReference('userReportTrafficByHostsGridRef');
        var gridStore = grid.getStore();

        gridStore.load({
            callback: function(records, operation, success) {
                grid.getView().setScrollY(0);
                }
            });
        },

    onShowUserReportTrafficByDatesClick: function() {
        var grid = this.lookupReference('userReportTrafficByDatesGridRef');
        var gridStore = grid.getStore();

        gridStore.load({
            callback: function(records, operation, success) {
                grid.getView().setScrollY(0);
                }
            });
        },

    onShowUserReportDayTrafficClick: function() {
        var grid = this.lookupReference('userReportDayTrafficGridRef');
        var gridStore = grid.getStore();

        gridStore.currentPage = 1;

        gridStore.load({
            callback: function(records, operation, success) {
                grid.getView().setScrollY(0);
                }
            });
        },
        
    beforeLoadUserReportTrafficByHostsGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId':this.getViewModel().data.currentUser.id,
            'dateBeg':this.lookupReference('userReportTrafficByHostsDateBegRef').getValue(),
            'dateEnd':this.lookupReference('userReportTrafficByHostsDateEndRef').getValue(),
            'limit':this.lookupReference('userReportTrafficByHostsLimitRef').getValue()
            });
        },

    beforeLoadUserReportTrafficByDatesGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId':this.getViewModel().data.currentUser.id,
            'dateBeg':this.lookupReference('userReportTrafficByDatesDateBegRef').getValue(),
            'dateEnd':this.lookupReference('userReportTrafficByDatesDateEndRef').getValue()
            });
        },

    beforeLoadUserReportDayTrafficGridStore: function(store) {
        store.getProxy().setExtraParams({
            'userId':this.getViewModel().data.currentUser.id,
            'date':this.lookupReference('userReportDayTrafficDateRef').getValue()
            });
        }
    })