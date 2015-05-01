Ext.define('tentacles.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mainviewcontroller',
 
    onTreeSelectionChange: function (model, selected) {
        switch (selected[0].data.objectType) {
	    case 'User':
	        this.getViewModel().linkTo('currentUser',{reference:'UserModel',id:selected[0].data.objectId});
			
		if (!this.lookupReference('detailsPanelRef').items.items[0] ||
		    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'userformview') {
				
		    this.lookupReference('detailsPanelRef').removeAll();
		    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserFormView());
		    }

                this.lookupReference('userFormViewRef').setActiveTab(0);

                //setting the default field values and clean up stores
                var today=new Date();

                //userReportTrafficByHosts
                this.lookupReference('userReportTrafficByHostsDateBegRef').setValue(
                    new Date(today.getFullYear(),today.getMonth(), 1));

                this.lookupReference('userReportTrafficByHostsDateEndRef').setValue(
                    new Date(today.getFullYear(),today.getMonth()+1, 0));

                this.lookupReference('userReportTrafficByHostsGridRef').getStore().removeAll();

                //userReportTrafficByDates
                this.lookupReference('userReportTrafficByDatesDateBegRef').setValue(
                    new Date(today.getFullYear(),today.getMonth(), 1));

                this.lookupReference('userReportTrafficByDatesDateEndRef').setValue(
                    new Date(today.getFullYear(),today.getMonth()+1, 0));

                this.lookupReference('userReportTrafficByDatesGridRef').getStore().removeAll();

                //userReportDateTraffic
                this.lookupReference('userReportDayTrafficDateRef').setValue(today);

                this.lookupReference('userReportDayTrafficGridRef').getStore().removeAll();
                this.lookupReference('userReportDayTrafficGridRef').getStore().currentPage = 1;

                this.lookupReference('userReportDayTrafficGridTbarRef').onLoad(); //Reset paging toolbar

		break;	
            case 'UserGroup':
		if (!this.lookupReference('detailsPanelRef').items.items[0] ||
		    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'usergroupformview') {
					
		    this.lookupReference('detailsPanelRef').removeAll();
		    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserGroupFormView());
		    }
				
		break;
	    default:
	        this.lookupReference('detailsPanelRef').removeAll();
				
		break;
	    }		
	},
		
    onSaveUserClick: function() {
	this.getViewModel().data.currentUser.save();
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
    });