Ext.define('tentacles.view.UserFormViewPropertiesTab', {
    extend: 'Ext.panel.Panel',
	
    alias: 'widget.userformviewproperties',

    title: 'Свойства',

    items: [		
        {
        xtype: 'displayfield',
    	labelWidth: 150,
        fieldLabel: 'ФИО',
	bind: {value: '{currentUser.cn}'}
	},		
	{
        xtype: 'displayfield',
	labelWidth: 150,
        fieldLabel: 'Логин',
	bind: {value: '{currentUser.userPrincipalName}'}
	},		
	{
        xtype: 'numberfield',
        width: 240,
	labelWidth: 150,
        fieldLabel: 'Квота, Мб',
	minValue: 0,
        maxValue: 1000000000, //~1 Pb seems to be enough
	bind: {value: '{currentUser.quota}'}
	},	
	{
        xtype: 'displayfield',
	labelWidth: 150,
        fieldLabel: 'Расход, Мб',
	bind: {value: '{currentUser.traffic}'},
        renderer: Ext.util.Format.numberRenderer('0.00')
	},	
	{
        xtype: 'combobox',
        width: 390,
	labelWidth: 150,
        fieldLabel: 'Состояние',
        editable: false,
	store:[
	    [0,'Заблокирован'],
	    [1,'Активен'],
            [2,'Отключен за превышение квоты']
	    ],
	bind: {value: '{currentUser.status}'}
	},
        {
        xtype: 'combobox',
        width: 390,
        labelWidth: 150,
        fieldLabel: 'Аутентификация',
        editable: false,

        store:[
            [0,'Kerberos'],
            [1,'IP']
            ],

        bind: {
            value: '{currentUser.authMethod}'
            }
        },
        {
        xtype: 'textfield',
        labelWidth: 150,
        fieldLabel: 'IP-адрес',
        maxLength: 15,
        enforceMaxLength: true,
        hidden: true,
        bind: {
            value: '{currentUser.ip}',
            hidden: '{isIpAuth}'
            }
        },
	{
        xtype: 'button',
    	width: 100,
        text: 'Сохранить',
        handler: 'onSaveUserClick'
        }]
    })