Ext.define('tentacles.model.MainTreeModel', {
    extend: 'tentacles.model.BaseModel',
	
    fields: [
        {name: 'objectType',type: 'string'}
        ],
		
    proxy: {
	type: 'rest',
	url: '/rest/tree/{node}',

	appendId: false,
        noCache: false,
		
	reader: {
    	type: 'json',
        rootProperty: 'children'
	    }
	}
    })