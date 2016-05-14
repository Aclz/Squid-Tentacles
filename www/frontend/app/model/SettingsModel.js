Ext.define('tentacles.model.SettingsModel', {
    extend: 'tentacles.model.BaseModel',
    		
    fields: [
        {name: 'id', type: 'int'},
        {name: 'defaultAccessTemplateId'},
        {name: 'defaultRoleId'}
        ],
	
    proxy: {
        type: 'rest',
        url: '/rest/settings',

        appendId: false,
        noCache: false,

        reader: {
            type: 'json',
            rootProperty: 'data',
            messageProperty: 'message'
            }
        }
    })