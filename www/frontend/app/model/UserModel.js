Ext.define('tentacles.model.UserModel', {
    extend: 'tentacles.model.BaseModel',
    		
    fields: [
	{name: 'id',type: 'int'},		
	{name: 'cn',type: 'string'},		
	{name: 'userPrincipalName',type: 'string'},		
	{name: 'quota',type: 'int'},		
	{name: 'traffic',type: 'float'},
	{name: 'status',type: 'int'},
        {name: 'authMethod',type: 'int'},
        
        {
        name: 'ip',
        type: 'string',
        validators: [
            { 
            type: 'format', 
            matcher: /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
            message: 'Допустимый диапазон IP-адресов: 0.0.0.0 – 255.255.255.255'
            }]
        }],
	
    proxy: {
	type: 'rest',
	url: '/rest/users',

	appendId: true,
        noCache: false,

        reader: {
            type: 'json',
            rootProperty: 'user'
            }
	}
    })