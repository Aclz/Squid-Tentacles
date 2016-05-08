Ext.define('tentacles.model.RoleModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id', type: 'int'},
        {
        name: 'name',
        type: 'string',
        
        validators: [{ 
            type: 'presence'
            }]
        }],
        
    proxy: {
        type: 'rest',
        url: '/rest/roles',

        appendId: true,
        noCache: false,
        limitParam: '',
        startParam: '',
        pageParam: '',

        reader: {
            type: 'json',
            rootProperty: 'data'
            }
        }
    })