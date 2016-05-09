Ext.define('tentacles.view.UserFormView', {
    extend: 'Ext.tab.Panel',
    
    alias: 'widget.userformview',

    requires: [
        'tentacles.view.UserFormViewPropertiesTab',
        'tentacles.view.UserFormViewReportTrafficByHostsTab',
        'tentacles.view.UserFormViewReportTrafficByDatesTab',
        'tentacles.view.UserFormViewReportDayTrafficTab',
        'tentacles.view.UserFormViewController'
        ],
        
    viewModel: {
        links: {
            selectedUser: {
                reference: 'UserModel',
                create: true
                }
            }
        },
        
    controller: 'userformviewcontroller',
    
    bodyPadding: 10,

    reference: 'userFormViewRef',

    items: [
        {
        xtype: 'userformviewproperties'
        },
        {
        xtype: 'userformviewreporttrafficbyhoststab',
        hidden: true
        },
        {
        xtype: 'userformviewreporttrafficbydatestab',
        hidden: true
        },
        {
        xtype: 'userformviewreportdaytraffictab',
        hidden: true
        }]
    })