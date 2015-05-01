Ext.define('tentacles.view.UserGroupFormView', {
    extend: 'Ext.form.Panel',
	
    alias: 'widget.usergroupformview',
	
    bodyPadding: 10,
    layout: 'form',
	
    items: [{
        xtype: 'displayfield',
        fieldLabel: 'Группа',		

        bind: {
            value: '{mainTreeViewRef.selection.text}'
            }
        }]
    })