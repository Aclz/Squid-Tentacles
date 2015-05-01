Ext.define('tentacles.model.UserModel', {
    extend: 'tentacles.model.BaseModel',
	
    idProperty: 'objectId',
	
    fields: [
	{
	name: 'objectId',
	type: 'int'
	},		
	{
	name: 'cn',
	type: 'string'
	},		
	{
	name: 'userPrincipalName',
	type: 'string'
	},		
	{
	name: 'quota',
	type: 'int'
	},		
	{
	name: 'traffic',
	type: 'int'
	},		
	{
	name: 'status',
	type: 'int'
	}
        ,
        {
        name: 'authMethod',
        type: 'int'
        },
        {
        name: 'ip',
        type: 'string'
        }
	],
	
    proxy: {
	type: 'rest',
	url: '/rest/users',

	appendId: true,
	idParam: 'objectId',
        noCache: false,

        reader: {
            type: 'json',
            rootProperty: 'user'
            }
	}
    })