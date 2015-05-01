Ext.define('tentacles.view.UserFormView', {
    extend: 'Ext.tab.Panel',
	
    alias: 'widget.userformview',

    requires: [
        'tentacles.view.UserFormViewPropertiesTab',
        'tentacles.view.UserFormViewReportTrafficByHostsTab',
        'tentacles.view.UserFormViewReportTrafficByDatesTab',
        'tentacles.view.UserFormViewReportDayTrafficTab'
        ],

    viewModel: {
        formulas: {
            isIpAuth: function (get) {
                return get('currentUser.authMethod') != 1;
                }
            }
        },
	
    bodyPadding: 10,

    reference: 'userFormViewRef',

    items: [
        {xtype: 'userformviewproperties'},
        {xtype: 'userformviewreporttrafficbyhoststab'},
        {xtype: 'userformviewreporttrafficbydatestab'},
        {xtype: 'userformviewreportdaytraffictab'}
        ]
    })