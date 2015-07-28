Ext.define('tentacles.model.UrlListModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id',type: 'int'},
        {
        name: 'name',
        type: 'string',
        
        validators: [{ 
            type: 'presence'
            }]
        },
        {name: 'whitelist',type: 'bool'}
		],
        
    proxy: {
        type: 'rest',
        url: '/rest/urllists',

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