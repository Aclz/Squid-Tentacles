Ext.define('tentacles.view.SettingsFormViewController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.settingsformviewcontroller',
    
    listen: {
        controller: {
            'mainviewcontroller': {
                onSettingsSelect: 'onSettingsSelect',
                beforeTreeSelectionChange: 'beforeTreeSelectionChange'
                }
            }
        },
        
    beforeTreeSelectionChange: function(args) {
        if (!args.selected) {
            return;
            }

        this.fireEvent('onTreeSelectionChange',{selected:args.selected});
        },
        
    onSettingsSelect: function() {
        this.getViewModel().linkTo('settings',{reference:'SettingsModel',id: 1});
        },
        
    onSaveSettingsClick: function() {
        this.getViewModel().data.settings.save();
        },

    onRevertSettingsClick: function() {
        this.getViewModel().data.settings.reject();
        }
    })