Ext.define('tentacles.view.UserFormViewReportDayTrafficTab', {
    extend: 'Ext.panel.Panel',
    
    alias: 'widget.userformviewreportdaytraffictab',

    title: 'Трафик за сутки',

    viewModel: {
        stores: {
            userReportDayTrafficGridStore: {
                fields: [
                    {name:'time',type:'date'},
                    {name:'url'},
                    {name:'traffic',type:'float'}
                    ],

                proxy: {
                    type: 'ajax',
                    url: '/rest/reports/user-day-traffic',

                    reader: {
                        type: 'json',
                        rootProperty: 'items',
                        idProperty: 'position'
                        }
                    },

                pageSize: 1000,

                autoLoad: false,

                listeners: {
                    beforeLoad: 'beforeLoadUserReportDayTrafficGridStore'
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

        items: [{
            xtype: 'datefield',
            reference: 'userReportDayTrafficDateRef',
            fieldLabel: 'Дата',
            labelWidth: 110,
            width: 250,
            format: 'd.m.Y'
            },
            {
            xtype: 'button',
            width: 100,
            text: 'Вывести',
            handler: 'onShowUserReportDayTrafficClick'
            }]
        },
        {
        xtype: 'grid',
        reference: 'userReportDayTrafficGridRef',
        margin: '10 0 0 0',
        columnLines: true,
        flex: 1,
        bufferedRenderer: false,
        disableSelection: true,

        viewConfig: {
            enableTextSelection: true
            },
    
        tbar: {
            xtype: 'pagingtoolbar',
            reference: 'userReportDayTrafficGridTbarRef',
            bind: {store: '{userReportDayTrafficGridStore}'},

            listeners: {
                afterrender: function() {
                    this.down('#refresh').hide();
                    }
                }
            },

        bind: {store: '{userReportDayTrafficGridStore}'},
            
        columns: [
            {
            text: '№',
            dataIndex: 'id',
            align: 'right',
            width: 50
            },
            {
            xtype: 'datecolumn',
            text: 'Время',
            dataIndex: 'time',
            format: 'd.m.Y H:i:s',
            width: 150
            },
            {
            text: 'Ссылка',
            dataIndex: 'url',
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