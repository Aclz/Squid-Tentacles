Ext.define('tentacles.model.AccessTemplateModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id',type: 'int'},
        {name: 'name',type: 'string'}
        ],
        
    proxy: {
        type: 'rest',
        url: '/rest/accesstemplates',

        appendId: true,
        noCache: false,
        limitParam: '',
        startParam: '',
        pageParam: '',

        reader: {
            type: 'json',
            rootProperty: 'accessTemplates'
            }
        }
    })