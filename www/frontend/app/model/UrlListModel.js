Ext.define('tentacles.model.UrlListModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id',type: 'int'},
        {name: 'name',type: 'string'}
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
            rootProperty: 'urlLists'
            }
        }
    })