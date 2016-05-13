Ext.onReady(function() {
    Ext.define("Ext.locale.ru.panel.Panel", {
        override: "Ext.panel.Panel",
        collapseToolText: 'Свернуть панель',
        expandToolText: 'Развернуть панель'
        });
        
    Ext.define("Ext.locale.ru.form.field.Date", {
        override: "Ext.form.field.Date",
        startDay: 1
        });
    });