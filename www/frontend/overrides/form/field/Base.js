Ext.define('Ext.overrides.form.field.Base', {
    override: 'Ext.form.field.Base',
    
    publishValue: function () {
        var me = this;

        if (me.rendered/* && !me.getErrors().length*/) {
            me.publishState('value', me.getValue());
            }
        }
    })