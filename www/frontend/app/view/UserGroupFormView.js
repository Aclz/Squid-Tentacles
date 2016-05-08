Ext.define('tentacles.view.UserGroupFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.usergroupformview',
    
    requires: [
        'tentacles.view.UserGroupFormViewController'
        ],
        
    viewModel: {
        stores: {
            groupUsersStore: {
                fields: [
                    {name: 'username'},
                    {name: 'status'},
                    {name: 'statusName', type: 'string'},
                    {name: 'roleId'},
                    {name: 'roleName', type: 'string'},
                    {name: 'accessTemplateId'},
                    {name: 'accessTemplateName', type: 'string'},
                    {name: 'authMethod'},
                    {name: 'authMethodName', type: 'string'},
                    {name: 'quota'},
                    {name: 'traffic'}
                    ],

                pageSize: 0,
                
                listeners: {
                    load: 'onGroupUserStoreLoad'
                    },

                proxy: {
                    type: 'ajax',
                    noCache: false,

                    url: '/rest/reports/group-users',

                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        idProperty: 'username'
                        }
                    },

                autoLoad: false
                },

            accessTemplatesStore: {
                model: 'AccessTemplateModel',
                pageSize: 0,
                autoLoad: false,

                listeners: {
                    load: 'onAccessTemplatesStoreLoad'
                    }
                },
                
            rolesStore: {
                model: 'RoleModel',
                pageSize: 0,
                autoLoad: false,

                listeners: {
                    load: 'onRolesStoreLoad'
                    }
                },
                
            userStatusesStore: {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'name'}
                    ],
                    
                data: [
                    [0, 'Заблокирован'],
                    [1, 'Активен'],
                    [2, 'Отключен за превышение квоты']
                    ]
                },
                
            authMethodsStore: {
                fields: [
                    {name: 'id', type: 'int'},
                    {name: 'name'}
                    ],
                
                data: [
                    [0, 'Kerberos'],
                    [1, 'IP']
                    ]
                }
            },
            
        formulas: {
            hideExtraColumns: function(get) {
                return this.get('myPermissionsStore').findExact('permissionName', 'ViewUsers') == -1;
                },
                
            hideRoleColumn: function(get) {
                return get('hideExtraColumns') ||
                    this.get('myPermissionsStore').findExact('permissionName', 'ViewPermissions') == -1;
                },
            }
        },
    
    controller: 'usergroupformviewcontroller',
    
    bodyPadding: 10,
    
    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
        },
    
    items: [{
        xtype: 'displayfield',
        fieldLabel: 'Группа',

        bind: {
            value: '{mainTreeViewRef.selection.text}'
            }
        },
        {
        xtype: 'grid',
        reference: 'userReportDayTrafficGridRef',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,
        
        bind: {
            store: '{groupUsersStore}'
            },

        viewConfig: {
            enableTextSelection: true,
            markDirty: false
            },
            
        columns: [
            {
            text: 'Пользователь',
            dataIndex: 'username',
            flex: 1
            },
            {
            text: 'Статус',
            width: 125,
            dataIndex: 'statusName'
            },
            {
            text: 'Роль',
            width: 125,
            dataIndex: 'roleName',
            hidden: true,
            
            bind: {
                hidden: '{hideRoleColumn}'
                }
            },
            {
            text: 'Аутентификация',
            width: 125,
            dataIndex: 'authMethodName',
            hidden: true,
            
            bind: {
                hidden: '{hideExtraColumns}'
                }
            },
            {
            text: 'Шаблон',
            width: 125,
            dataIndex: 'accessTemplateName',
            hidden: true,
            
            bind: {
                hidden: '{hideExtraColumns}'
                }
            },
            {
            xtype: 'numbercolumn',
            text: 'Квота, Мб',
            dataIndex: 'quota',
            align: 'right',
            format: '0',
            width: 110
            },
            {
            xtype: 'numbercolumn',
            text: 'Трафик, Мб',
            dataIndex: 'traffic',
            align: 'right',
            format: '0.00',
            width: 110
            }]
        }]
    })