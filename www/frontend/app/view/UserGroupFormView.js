Ext.define('tentacles.view.UserGroupFormView', {
    extend: 'Ext.tab.Panel',
    
    alias: 'widget.usergroupformview',
    
    requires: [
        'tentacles.view.UserGroupFormViewMembersTab',
        'tentacles.view.UserGroupFormViewController'
        ],
        
    viewModel: {
        data: {
            selectedGroupId: 0
            }
        },
    
    controller: 'usergroupformviewcontroller',
    
    bodyPadding: 10,
    
    items: [
        {
        xtype: 'usergroupformviewmembers',
        reference: 'userGroupFormViewMembersTab'
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