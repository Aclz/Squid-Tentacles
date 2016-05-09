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
        data: {
            projectName: 'Squid Tentacles v0.7.5.1 beta'
            },
            
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
                    
                autoLoad: true,

                proxy: {
                    type: 'rest',
                    url: '/rest/mypermissions',

                    appendId: false,
                    noCache: false,

                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                        }
                    }
                },
                
            mainTreeStore: {
                type: 'tree',
                model: 'MainTreeModel',  
                rootVisible: true,
                    
                root: {
                    text: 'Tentacles',
                    expanded: true,
                    objectType: 'RootContainer'
                    }
                }
            }
        },
        
    controller: 'mainviewcontroller',
    
    listeners: {
        render: 'onRender'
        },
    
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
            flex: 1,
                 
            bind: {
                title: '{projectName}'
                },
            
            title: 'Tentacles'
            },
            {
            xtype: 'panel',
            flex: 2,
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
        
        bind: {
            store: '{mainTreeStore}'
            },
            
        reference: 'mainTreeViewRef',
        width: 360,    
        useArrows: true,
        title: 'Navigation tree',
        header: false,    
        
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