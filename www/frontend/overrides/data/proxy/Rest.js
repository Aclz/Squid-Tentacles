Ext.define('Ext.overrides.data.proxy.Rest',{
    override: 'Ext.data.proxy.Rest',
  
    buildUrl: function(request) {    
        var me = this,
            url = me.getUrl(request),
            params = request.getParams();
            
        if (params) {
            for (param in params) {
                request.setUrl(url.replace('{' + param + '}',params[param]));
                delete params[param];
                };
            }
 
        return me.callParent([request]);
        }
    });