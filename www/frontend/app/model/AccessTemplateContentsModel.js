Ext.define('tentacles.model.AccessTemplateContentsModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id', type: 'int'},
        {
	name: 'urlListId',
	reference: 'UrlListModel',
	unique: true
	},
        {name: 'orderNumber', type: 'int'}
	],
        
    proxy: {
        type: 'rest',
        url: '/rest/accesstemplates/{parentId}/contents',

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