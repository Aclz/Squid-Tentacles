Ext.define('tentacles.view.MainView', {
    extend: 'Ext.container.Viewport',

    requires: [
        'tentacles.view.MainViewController',
        'tentacles.view.UserFormView',
        'tentacles.view.UserGroupFormView',
        'tentacles.view.RolesFormView',
        'tentacles.view.RolePermissionsFormView',
        'tentacles.view.UrlListsFormView',
        'tentacles.view.UrlMasksFormView',
        'tentacles.view.AccessTemplatesFormView',
        'tentacles.view.AccessTemplateContentsFormView'
    ],
        
    viewModel: {            
        links: {
            loggedInUser: {
                reference: 'LoggedInUserModel',
                create: true
                }
            },
        
        stores: {
            myPermissionsStore: {
                fields: [
                    {name: 'permissionId', type: 'int'},
                    {name: 'permissionName', type: 'string'}
                    ],
                    
                autoLoad: false,

                proxy: {
                    type: 'rest',
                    url: '/rest/mypermissions',

                    appendId: false,
                    noCache: false,

                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                        }
                    },
                    
                listeners: {
                    load: 'onMyPermissionsStoreLoad'
                    }
                },
                
            mainTreeStore: {
                type: 'tree',
                model: 'MainTreeModel',
                    
                root: {
                    text: 'Tentacles',
                    expanded: true,
                    objectType: 'RootContainer'
                    },
                    
                listeners: {
                    load: {
                        fn: 'onMainTreeStoreLoad',
                        single: true
                        }
                    }
                }
            },
            
        formulas: {
            hideExtraControls: {
                bind: {
                    bindTo: '{myPermissionsStore}',
                    deep: true
                    },
                 
                get: function(store) {
                    return store.getCount() == 0;
                    }
                }
            }
        },
        
    controller: 'mainviewcontroller',
    
    layout: 'border',

    items: [
        {
        xtype: 'container',        
        region: 'north',
        
        layout: {
            type: 'hbox',
            pack: 'start',
            align: 'stretch'
            },
        
        items: [
            {
            xtype: 'panel',
            flex: 2,
            title: 'Squid Tentacles v0.7.9.2 beta'
            },
            {
            xtype: 'panel',
            flex: 1,
            titleAlign: 'right',

            bind: {
                title: '{loggedInUser.cn}'
                },

            title: 'Нет связи с сервером!'
            }]
        },       
        {
        xtype: 'treepanel',
        region: 'west',
        split: true,
        rootVisible: false,
        collapsible: true,
        
        bind: {
            store: '{mainTreeStore}'
            },
            
        reference: 'mainTreeViewRef',
        width: 360,    
        useArrows: true,
        title: 'Навигация',
        header: false,

        dockedItems: [
            {
            xtype: 'toolbar',
            dock: 'top',
            layout: 'hbox',
            hidden: true,
            
            bind: {
                hidden: '{hideExtraControls}'
                },
            
            items: [
                {
                xtype: 'textfield',
                fieldLabel: 'Быстрый поиск',
                labelWidth: 100,
                flex: 1,
                
                triggers: {
                    clearBtn: {
                        cls: 'x-form-clear-trigger',
                        
                        handler: function() {
                            this.reset();
                            }
                        }
                    },
                
                listeners: {
                    change: 'onFilterFieldChange'
                    }
                }]
            },
            {
            xtype: 'toolbar',
            reference: 'bottomTreeToolbarRef',
            dock: 'bottom',
            layout: 'hbox',
            hidden: true,
            
            bind: {
                hidden: '{hideExtraControls}'
                },            
            
            items: [
                {
                text: 'Развернуть всё',               
                handler: 'expandTree',
                flex: 1
                },
                {
                text: 'Свернуть всё',               
                handler: 'collapseTree',
                flex: 1
                }]
            }],
        
        listeners: {
            beforeselect: 'beforeTreeSelect'
            }
        },        
        {
        xtype: 'panel',
        region: 'center',
        reference: 'detailsPanelRef',
        autoDestroy: true,
        layout : 'fit',
        title: 'Details',
        header: false
        }]
    });