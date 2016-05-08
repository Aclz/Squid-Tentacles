Ext.define('tentacles.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.mainviewcontroller',
    
    listen: {
        controller: {
            '*': {
                onTreeSelectionChange: 'onTreeSelectionChange'
                },
                
            'rolesformviewcontroller': {
                onRoleReloadRequest: 'onRoleReloadRequest'
                },
                
            'rolepermissionsformviewcontroller': {
                onRoleReloadRequest: 'onRoleReloadRequest'
                },
                                
            'urllistsformviewcontroller': {
                onUrlListReloadRequest: 'onUrlListReloadRequest'
                },
                
            'urlmasksformviewcontroller': {
                onUrlListReloadRequest: 'onUrlListReloadRequest'
                },
                
            'accesstemplatesformviewcontroller': {
                onAccessTemplateReloadRequest: 'onAccessTemplateReloadRequest'
                },
                
            'accesstemplatecontentsformviewcontroller': {
                onAccessTemplateReloadRequest: 'onAccessTemplateReloadRequest'
                }
            }
        },
        
    onRender: function() {
        var thisController = this;
        
        this.getViewModel().data.loggedInUser.load({
            failure: function(record, operation) {
                if (operation.error && operation.error.status == 403) {
                    thisController.getViewModel().data.loggedInUser = {
                        cn: 'Нет доступа',
                        status: 2
                        };

                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: 'Недостаточно прав доступа!',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    }
                else if (operation.error.status == 502) {
                    thisController.getViewModel().data.loggedInUser = {
                        cn: 'Нет связи',
                        status: 2
                        };
                        
                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: 'Нет связи с сервером!',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    }
                else {
                    thisController.getViewModel().data.loggedInUser = {
                        cn: 'Анонимный пользователь',
                        status: 2
                        };

                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: 'Ошибка аутентификации пользователя',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    }
                }
            });
        },
 
    onTreeSelectionChange: function(args) {
        if (!args || !args.selected || !args.selected.data || !args.selected.data.objectType) {            
            return;
            }
        
        switch (args.selected.data.objectType) {
            case 'User':    
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'userformview') {
                        
                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserFormView());
                    }
                    
                this.fireEvent('onUserSelect', args.selected.data.id.replace('user_', ''));

                break;    
            case 'UserGroup':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'usergroupformview') {
                            
                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserGroupFormView());
                    }
                    
                this.fireEvent('onUserGroupSelect', args.selected.data.id.replace('usergroup_', ''));
                        
                break;
            case 'Roles':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'rolesformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.RolesFormView());
                    }

                this.fireEvent('onRolesSelect');

                break;
            case 'Role':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'rolepermissionsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.RolePermissionsFormView());
                    }

                this.fireEvent('onRoleSelect', args.selected.data.id.replace('role_', ''));

                break;
            case 'UrlLists':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'urllistsformview') {
                    
                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UrlListsFormView());
                    }
                    
                this.fireEvent('onUrlListsSelect');

                break;
            case 'UrlList':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'urlmasksformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UrlMasksFormView());
                    }
                
                this.fireEvent('onUrlListSelect', args.selected.data.id.replace('urllist_', ''));

                break;
            case 'AccessTemplates':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'accesstemplatesformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.AccessTemplatesFormView());
                    }

                this.fireEvent('onAccessTemplatesSelect');

                break;
            case 'AccessTemplateContents':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'accesstemplatecontentsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.AccessTemplateContentsFormView());
                    }

                this.fireEvent('onAccessTemplateContentsSelect', args.selected.data.id.replace('accesstemplate_', ''));

                break;
            default:
                this.lookupReference('detailsPanelRef').removeAll();
                
                break;
            }     
        },
    
    beforeTreeSelect: function(model, selected) {        
        //If there is a child form in the right frame, first signal it about the selection change intention
        //and exit (do not change selection for now)
        if (this.lookupReference('detailsPanelRef').items.length != 0) {
            this.fireEvent('beforeTreeSelectionChange', {selected: selected});
            }
        else {
            this.onTreeSelectionChange({selected: selected});
            }
        },
    
    onUrlListReloadRequest: function () {
        var urlListsRootNode = this.getStore('mainTreeStore').getRootNode().findChildBy(
            function(child) {
                if (child.data.objectType == 'UrlLists') {
                    return true;
                    }
                else {
                    return false;
                    }
                }
            );
            
        if (urlListsRootNode) {
            var isNodeExpanded = urlListsRootNode.isExpanded();
            
            if (!isNodeExpanded) {
                urlListsRootNode.expand();
                }
            
            this.getViewModel().getStore('mainTreeStore').load({
                node: urlListsRootNode,
                
                callback: function() {
                    if (!isNodeExpanded) {
                        urlListsRootNode.collapse();
                        }
                    }
                });
            };
        },
        
    onAccessTemplateReloadRequest: function () {
        var accessTemplatesRootNode = this.getStore('mainTreeStore').getRootNode().findChildBy(
            function(child) {
                if (child.data.objectType == 'AccessTemplates') {
                    return true;
                    }
                else {
                    return false;
                    }
                }
            );

        if (accessTemplatesRootNode) {
            var isNodeExpanded = accessTemplatesRootNode.isExpanded();

            if (!isNodeExpanded) {
                accessTemplatesRootNode.expand();
                }

            this.getViewModel().getStore('mainTreeStore').load({
                node: accessTemplatesRootNode,

                callback: function() {
                    if (!isNodeExpanded) {
                        accessTemplatesRootNode.collapse();
                        }
                    }
                });
            };
        },
        
    onRoleReloadRequest: function () {
        var rolesRootNode = this.getStore('mainTreeStore').getRootNode().findChildBy(
            function(child) {
                if (child.data.objectType == 'Roles') {
                    return true;
                    }
                else {
                    return false;
                    }
                }
            );

        if (rolesRootNode) {
            var isNodeExpanded = rolesRootNode.isExpanded();

            if (!isNodeExpanded) {
                rolesRootNode.expand();
                }

            this.getViewModel().getStore('mainTreeStore').load({
                node: rolesRootNode,

                callback: function() {
                    if (!isNodeExpanded) {
                        rolesRootNode.collapse();
                        }
                    }
                });
            };
        }
    });