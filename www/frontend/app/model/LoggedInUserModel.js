Ext.define('tentacles.model.LoggedInUserModel', {
    extend: 'tentacles.model.BaseModel',
    		
    fields: [
        {name: 'id', type: 'int'},
        {name: 'status', type: 'int'},
        {name: 'cn', type: 'string'}
        ],
	
    proxy: {
        type: 'rest',
        url: '/rest/whoami',

        appendId: false,
        noCache: false,

        reader: {
            type: 'json',
            rootProperty: 'data'
            }
        }
    })