Ext.define('tentacles.model.SettingsModel', {
    extend: 'tentacles.model.BaseModel',
    		
    fields: [
        {name: 'id',type: 'int'},
	{name: 'defaultAccessTemplate',type: 'int'}
	],
	
    proxy: {
	type: 'rest',
	url: '/rest/settings',

	appendId: false,
        noCache: false,

        reader: {
            type: 'json',
            rootProperty: 'settings'
            }
	}
    })