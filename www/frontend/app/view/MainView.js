Ext.define('tentacles.view.MainView', {
    extend: 'Ext.container.Container',

    requires: [
	'tentacles.view.MainViewController',
	'tentacles.view.UserFormView',
	'tentacles.view.UserGroupFormView'
	],
		
    viewModel: {
	data: {
            projectname: 'Squid Tentacles v0.2.1.0'
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
	    },
			
	links: {
	    currentUser: {
	        reference: 'UserModel',
		create: true
		}
	    }
	},
		
    controller: 'mainviewcontroller',
	
    layout: {type: 'border'},

    items: [
        {
	xtype: 'panel',	
	bind: {title: '{projectname}'},			
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
	listeners: {selectionchange: 'onTreeSelectionChange'}
	},		
	{
	xtype: 'panel',
	region: 'center',
	reference: 'detailsPanelRef',
	autoDestroy: true,
        layout : 'fit'
	}]
    });