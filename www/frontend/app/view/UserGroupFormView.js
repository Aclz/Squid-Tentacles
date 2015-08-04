Ext.define('tentacles.view.UserGroupFormView', {
    extend: 'Ext.form.Panel',
    
    alias: 'widget.usergroupformview',
    
    requires: [
        'tentacles.view.UserGroupFormViewController'
        ],
        
    viewModel: {
        stores: {
            accessTemplatesStore: {
                model: 'AccessTemplateModel',
                pageSize: 0,
                autoLoad: true,

                listeners: {
                    load: 'onAccessTemplatesStoreLoad'
                    }
                },

            groupUsersStore: {
                fields: [
                    {name:'username'},
                    {name:'status'},
                    {name:'accesstemplatename'},
                    {name:'quota',type:'float'},
                    {name:'traffic',type:'float'}
                    ],

                pageSize: 0,

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
                
            userStatusesStore: {
                fields: [
                    {name:'id',type:'int'},
                    {name:'name'}
                    ],
                    
                data: [
                    [0,'Заблокирован'],
                    [1,'Активен'],
                    [2,'Отключен за превышение квоты']
                    ]
                },
                
            authMethodsStore: {
                fields: [
                    {name:'id',type:'int'},
                    {name:'name'}
                    ],
                
                data: [
                    [0,'Kerberos'],
                    [1,'IP']
                    ]
                }
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
            enableTextSelection: true
            },
            
        columns: [
            {
            text: 'Пользователь',
            dataIndex: 'username',
            flex: 1
            },
            {
            text: 'Статус',
            width: 150,
            renderer: 'renderUserStatus'
            },
            {
            text: 'Аутентификация',
            width: 150,
            renderer: 'renderUserAuthMethod'
            },
            {
            text: 'Шаблон',
            width: 150,
            renderer: 'renderUserAccessTemplate'
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