Ext.define('tentacles.view.UserGroupFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.usergroupformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        this.fireEvent('onTreeSelectionChange',{selected:args.selected});
        }
    })