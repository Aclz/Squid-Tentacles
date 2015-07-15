Ext.define('tentacles.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.mainviewcontroller',
    
    listen: {
        controller: {
            '*': {
                onUrlListReloadRequest: 'onUrlListReloadRequest'
                }
            }
        },
 
    onTreeSelectionChange: function (model, selected) {
        if (!selected[0]) {
            return;
            }
        
        switch (selected[0].data.objectType) {
	    case 'User':	
		if (!this.lookupReference('detailsPanelRef').items.items[0] ||
		    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'userformview') {
				
		    this.lookupReference('detailsPanelRef').removeAll();
		    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserFormView());
		    }
		    
                this.fireEvent('onUserSelect',selected[0].data.id);

		break;	
            case 'UserGroup':
		if (!this.lookupReference('detailsPanelRef').items.items[0] ||
		    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'usergroupformview') {
					
		    this.lookupReference('detailsPanelRef').removeAll();
		    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserGroupFormView());
		    }
				
		break;
	    case 'UrlLists':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'urllistsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UrlListsFormView());
                    }
                    
                this.fireEvent('onUrlListsSelect',selected[0].data.id);

                break;
            case 'UrlList':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'urlmasksformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UrlMasksFormView());
                    }
                
                this.fireEvent('onUrlListSelect',selected[0].data.id);

                break;
	    default:
	        this.lookupReference('detailsPanelRef').removeAll();
				
		break;
	    }		
	},
	
    onUrlListReloadRequest: function () {
        var urlListsRootNode = this.getViewModel().getStore('maintreestore').getRootNode().findChildBy(
            function(child) {
                if (child.data.objectType == 'UrlLists') {
                    return true;
                    }
                else {
                    return false;
                    }
                }
            );
            
        if (urlListsRootNode) {
            this.getViewModel().getStore('maintreestore').load({
                node: urlListsRootNode
                });
            };
        }
    });