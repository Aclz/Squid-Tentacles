Ext.define('tentacles.view.UserGroupFormViewReportTrafficByUsersTab', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.usergroupformviewreporttrafficbyuserstab',

    title: 'Трафик по пользователям',

    viewModel: {
        stores: {
            userGroupReportTrafficByUsersGridStore: {
                fields: [
                    {name: 'position', type: 'int'},
                    {name: 'cn'},
                    {name: 'userprincipalname'},
                    {name: 'traffic', type: 'float'}
                    ],

                pageSize: 0,

                proxy: {
                    type: 'ajax',
                    url: '/rest/reports/group-traffic-by-users',

                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        idProperty: 'position'
                        }
                    },

                autoLoad: false,

                listeners: {
                    beforeLoad: 'beforeLoadUserGroupReportTrafficByUsersGridStore'
                    }
                }
            }
        },

    layout: {
        type: 'vbox',
        align : 'stretch',
        pack  : 'start'
        },

    items: [
        {
        xtype: 'container',
        layout: 'auto',
        margin: '0 5 5 0',

        items: [
            {
            xtype: 'datefield',
            reference: 'userGroupReportTrafficByUsersDateBegRef',
            fieldLabel: 'Начало периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'datefield',
            reference: 'userGroupReportTrafficByUsersDateEndRef',
            fieldLabel: 'Конец периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'numberfield',
            reference: 'userGroupReportTrafficByUsersLimitRef',
            width: 250,
            labelWidth: 130,
            fieldLabel: 'Количество (0 - все)',
            minValue: 0,
            maxValue: 9999,
            value: 0
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Вывести',
            handler: 'onShowUserGroupReportTrafficByUsersClick'
            }]
        },
        {
        xtype: 'grid',
        reference: 'userGroupReportTrafficByUsersGridRef',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,

        viewConfig: {
            enableTextSelection: true
            },

        bind: {
            store: '{userGroupReportTrafficByUsersGridStore}'
            },
            
        columns: [
            {
            text: '№',
            dataIndex: 'position',
            align: 'right',
            width: 50
            },
            {
            text: 'Пользователь',
            dataIndex: 'cn',
            flex: 2
            },
            {
            text: 'Логин',
            dataIndex: 'userprincipalname',
            flex: 1
            },
            {
            xtype: 'numbercolumn',
            text: 'Трафик, Мб',
            dataIndex: 'traffic',
            align: 'right',
            format: '0.0000',
            width: 120
            }]
        }]
    })