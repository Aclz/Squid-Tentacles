Ext.define('tentacles.model.AclContentsModel', {
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
        url: '/rest/acls/{parentId}/contents',

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