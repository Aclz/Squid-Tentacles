Ext.define('tentacles.view.UserFormViewReportTrafficByHostsTab', {
    extend: 'Ext.panel.Panel',
	
    alias: 'widget.userformviewreporttrafficbyhoststab',

    title: 'Трафик по сайтам',

    viewModel: {
        stores: {
            userReportTrafficByHostsGridStore: {
                fields: [
                    {name:'position',type:'int'},
                    {name:'host'},
                    {name:'traffic',type:'float'}
                    ],

                pageSize: 0,

                proxy: {
                    type: 'ajax',
                    url: '/rest/reports/user-traffic-by-hosts',

                    reader: {
                        type: 'json',
                        rootProperty: 'items',
                        idProperty: 'position'
                        }
                    },

                autoLoad: false,

                listeners: {
                    beforeLoad: 'beforeLoadUserReportTrafficByHostsGridStore'
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
        layout: 'auto',

        items: [
            {
            xtype: 'datefield',
            reference: 'userReportTrafficByHostsDateBegRef',
            fieldLabel: 'Начало периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'datefield',
            reference: 'userReportTrafficByHostsDateEndRef',
            fieldLabel: 'Конец периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'numberfield',
            reference: 'userReportTrafficByHostsLimitRef',
            width: 250,
            labelWidth: 130,
            fieldLabel: 'Количество (0 - все)',
            minValue: 0,
            maxValue: 9999,
            value: 100
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Вывести',
            handler: 'onShowUserReportTrafficByHostsClick'
            }]
        },
        {
        xtype: 'grid',
        reference: 'userReportTrafficByHostsGridRef',
        margin: '10 0 0 0',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,

        viewConfig: {
            enableTextSelection: true
            },

        bind: {store: '{userReportTrafficByHostsGridStore}'},
            
        columns: [
            {
            text: '№',
            dataIndex: 'position',
            align: 'right'
            },
            {
            text: 'Сайт',
            dataIndex: 'host',
            flex: 1
            },
            {
            xtype: 'numbercolumn',
            text: 'Трафик, Мб',
            dataIndex: 'traffic',
            align: 'right',
            format: '0.00'
            }]
        }]
    })