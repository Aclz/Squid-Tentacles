Ext.define('tentacles.model.MainTreeModel', {
    extend: 'tentacles.model.BaseModel',
	
    idProperty: 'objectId',
	
    fields: [
	{name: 'objectType',type: 'string'}
	],
		
    proxy: {
	type: 'rest',
	url: '/rest/tree',

	appendId: false,
        noCache: false,
		
	reader: {
    	    type: 'json',
            rootProperty: 'children'
	    }
	}
    })