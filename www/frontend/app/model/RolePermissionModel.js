Ext.define('tentacles.model.RolePermissionModel', {
    extend: 'tentacles.model.BaseModel',

    fields: [
        {name: 'id', type: 'int'},
        {name: 'permissionId', type: 'int'}
        ],
        
    proxy: {
        type: 'rest',
        url: '/rest/roles/{parentId}/permissions',

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