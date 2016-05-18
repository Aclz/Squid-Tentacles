Ext.define('tentacles.view.UserGroupFormViewMembersTab', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.usergroupformviewmembers',
        
    viewModel: {
        stores: {
            groupMembersStore: {
                fields: [
                    {name: 'username'},
                    {name: 'status'},
                    {name: 'statusName', type: 'string'},
                    {name: 'roleId'},
                    {name: 'roleName', type: 'string'},
                    {name: 'aclId'},
                    {name: 'aclName', type: 'string'},
                    {name: 'authMethod'},
                    {name: 'authMethodName', type: 'string'},
                    {name: 'quota'},
                    {name: 'traffic'}
                    ],

                pageSize: 0,
                
                proxy: {
                    type: 'ajax',
                    noCache: false,

                    url: '/rest/reports/group-members',

                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        idProperty: 'username'
                        }
                    },

                autoLoad: false,

                listeners: {
                    beforeLoad: 'beforeLoadGroupMembersStore',
                    load: 'onGroupMembersStoreLoad'
                    }
                },

            aclStore: {
                model: 'AclModel',
                pageSize: 0,
                autoLoad: false,

                listeners: {
                    load: 'onAclStoreLoad'
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
                    [0, 'Пользователь'],
                    [1, 'IP-адрес']
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
                }
            }
        },
    
    title: 'Пользователи',
    
    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
        },
    
    items: [{
        xtype: 'displayfield',
        fieldLabel: 'Группа',
        labelWidth: 50,

        bind: {
            value: '{mainTreeViewRef.selection.text}'
            }
        },
        {
        xtype: 'grid',
        reference: 'groupReportMembersGridRef',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,
        
        bind: {
            store: '{groupMembersStore}'
            },

        viewConfig: {
            enableTextSelection: true,
            markDirty: false
            },
            
        columns: [
            {
            text: 'Пользователь',
            dataIndex: 'username',
            flex: 3.5
            },
            {
            text: 'Статус',
            dataIndex: 'statusName',
            flex: 2
            },
            {
            text: 'Роль',
            dataIndex: 'roleName',
            flex: 2,
            hidden: true,
            
            bind: {
                hidden: '{hideRoleColumn}'
                }
            },
            {
            text: 'Авторизация',
            dataIndex: 'authMethodName',
            flex: 2,
            hidden: true,
            
            bind: {
                hidden: '{hideExtraColumns}'
                }
            },
            {
            text: 'Список доступа',
            dataIndex: 'aclName',
            flex: 2,
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
            flex: 1.5
            },
            {
            xtype: 'numbercolumn',
            text: 'Доп. квота, Мб',
            dataIndex: 'extraQuota',
            align: 'right',
            format: '0',
            flex: 1.5
            },
            {
            xtype: 'numbercolumn',
            text: 'Трафик, Мб',
            dataIndex: 'traffic',
            align: 'right',
            format: '0.00',
            flex: 1.5
            }]
        }]
    })