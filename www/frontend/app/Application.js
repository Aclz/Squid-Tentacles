/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('tentacles.Application', {
    extend: 'Ext.app.Application',
    
    requires: [
        'tentacles.model.*'
        ],
    
    name: 'tentacles',

    stores: [
        // TODO: add global / shared stores here
    ],

    onAppUpdate: function () {
        Ext.Msg.confirm('Обновление программы', 'Обнаружено обновление программы, загрузить?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});
