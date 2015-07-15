Ext.define('tentacles.view.MainView', {
    extend: 'Ext.panel.Panel',

    requires: [
	'tentacles.view.MainViewController',
	'tentacles.view.UserFormView',
	'tentacles.view.UserGroupFormView',
	'tentacles.view.UrlListsFormView',
	'tentacles.view.UrlMasksFormView'
	],
		
    viewModel: {
	data: {
            projectname: 'Squid Tentacles v0.4.0.0'
	    },
	
	stores: {
	    maintreestore: {
	        type: 'tree',
	        model: 'MainTreeModel',
				
	        rootVisible: true,
				
    	        root: {
	            text: 'Tentacles',
		    expanded: true,
                    objectType: 'RootContainer'
		    }
	        }
	    }
	},
		
    controller: 'mainviewcontroller',
	
    layout: 'border',

    items: [
        {
	xtype: 'panel',
	
	bind: {
	    title: '{projectname}'
	    },
	    
	title: 'Tentacles',
	
	region: 'north'
	},		
	{
	xtype: 'treepanel',
	region: 'west',
	split: true,
	bind: '{maintreestore}',		
	reference: 'mainTreeViewRef',
	width: 360,	
	useArrows: true,
	title: 'Navigation tree',
	header: false,	
	
	listeners: {
	    selectionchange: 'onTreeSelectionChange'
	    }
	},		
	{
	xtype: 'panel',
	region: 'center',
	reference: 'detailsPanelRef',
	autoDestroy: true,
        layout : 'fit',
        title: 'Details',
        header: false
	}]
    });