Ext.define('tentacles.view.UserFormViewReportTrafficByDatesTab', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.userformviewreporttrafficbydatestab',

    title: 'Трафик по датам',

    viewModel: {
        stores: {
            userReportTrafficByDatesGridStore: {
                fields: [
                    {name:'position',type:'int'},
                    {name:'date'},
                    {name:'traffic',type:'float'}
                    ],

                pageSize: 0,

                proxy: {
                    type: 'ajax',
                    url: '/rest/reports/user-traffic-by-dates',

                    reader: {
                        type: 'json',
                        rootProperty: 'data',
                        idProperty: 'position'
                        }
                    },

                autoLoad: false,

                listeners: {
                    beforeLoad: 'beforeLoadUserReportTrafficByDatesGridStore'
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
            reference: 'userReportTrafficByDatesDateBegRef',
            fieldLabel: 'Начало периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'datefield',
            reference: 'userReportTrafficByDatesDateEndRef',
            fieldLabel: 'Конец периода',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Вывести',
            handler: 'onShowUserReportTrafficByDatesClick'
            }]
        },
        {
        xtype: 'grid',
        reference: 'userReportTrafficByDatesGridRef',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,

        viewConfig: {
            enableTextSelection: true
            },

        bind: {
            store: '{userReportTrafficByDatesGridStore}'
            },
            
        columns: [
            {
            text: '№',
            dataIndex: 'position',
            align: 'right',
            width: 50
            },
            {
            xtype: 'datecolumn',
            text: 'Дата',
            format: 'd.m.Y',
            dataIndex: 'date'
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