Ext.define('tentacles.model.UrlMaskModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id',type: 'int'},
        {name: 'name',type: 'string'}
        ],
        
    proxy: {
        type: 'rest',
        url: '/rest/urllists/{parentId}',

        appendId: true,
        noCache: false,
        limitParam: '',
        startParam: '',
        pageParam: '',

        reader: {
            type: 'json',
            rootProperty: 'urlMasks'
            }
        }
    })