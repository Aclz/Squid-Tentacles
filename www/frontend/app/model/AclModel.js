Ext.define('tentacles.model.AclModel', {
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
        url: '/rest/acls',

        appendId: true,
        noCache: false,
        limitParam: '',
        startParam: '',
        pageParam: '',

        reader: {
            type: 'json',
            rootProperty: 'data',
            messageProperty: 'message'
            }
        }
    })