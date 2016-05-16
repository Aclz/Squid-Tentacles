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
                
            'aclsformviewcontroller': {
                onAclReloadRequest: 'onAclReloadRequest'
                },
                
            'aclcontentsformviewcontroller': {
                onAclReloadRequest: 'onAclReloadRequest'
                }
            }
        },
 
    onTreeSelectionChange: function(args) {
        if (!args || !args.selected || !args.selected.data || !args.selected.data.objectType) {
            this.lookupReference('detailsPanelRef').removeAll();
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
            case 'Acls':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'aclsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.AclsFormView());
                    }

                this.fireEvent('onAclsSelect');

                break;
            case 'AclContents':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'aclcontentsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.AclContentsFormView());
                    }

                this.fireEvent('onAclContentsSelect', args.selected.data.id.replace('acl_', ''));

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
        
    onAclReloadRequest: function () {
        var aclsRootNode = this.getStore('mainTreeStore').getRootNode().findChildBy(
            function(child) {
                if (child.data.objectType == 'Acls') {
                    return true;
                    }
                else {
                    return false;
                    }
                }
            );

        if (aclsRootNode) {
            var isNodeExpanded = aclsRootNode.isExpanded();

            if (!isNodeExpanded) {
                aclsRootNode.expand();
                }

            this.getViewModel().getStore('mainTreeStore').load({
                node: aclsRootNode,

                callback: function() {
                    if (!isNodeExpanded) {
                        aclsRootNode.collapse();
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
        },
        
    onFilterFieldChange: function(textfield, value) {
        var tree = this.lookupReference('mainTreeViewRef');
        var regexp = new RegExp(value, 'i'); //i - case insensitive option

        try {
            Ext.suspendLayouts();
            
            tree.store.filter({
                filterFn: function(node) {
                    var children = node.childNodes;
                    var len = children && children.length,

                    // Visibility of leaf nodes is whether they pass the test.
                    // Visibility of branch nodes depends on them having visible children.
                    visible = node.isLeaf() ? regexp.test(node.get('text')) : false, i;

                    // We're visible if one of our child nodes is visible.
                    // No loop body here. We are looping only while the visible flag remains false.
                    // Child nodes are filtered before parents, so we can check them here.
                    // As soon as we find a visible child, this branch node must be visible.
                    for (i = 0; i < len && !(visible = children[i].get('visible')); i++);
                    
                    return visible;
                    },
                
                id: 'treeFilter'
                });
            
            Ext.resumeLayouts(true);
            }
        catch (e) {
            textfield.markInvalid('Invalid regular expression');
            }
        },
    
    onMainTreeStoreLoad: function(store) {
        this.getStore('myPermissionsStore').load();
        },
        
    onMyPermissionsStoreLoad: function() {
        thisController = this;
        
        this.getViewModel().data.loggedInUser.load({
            failure: function(record, operation) {
                if (operation.error && operation.error.status == 403) {
                    thisController.getViewModel().data.loggedInUser = {
                        cn: 'Нет доступа',
                        status: 2
                        };

                    Ext.MessageBox.show({
                        title: 'Ошибка',
                        message: 'Недостаточно прав доступа!<br>Возможно, пользователь не имеет доступа к прокси-серверу.',
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
                        message: 'Ошибка аутентификации пользователя!<br>Возможно, пользователь не зарегистрирован в системе.',
                        buttons: Ext.Msg.OK,
                        icon: Ext.MessageBox.ERROR
                        });
                    }
                },
                
            success: function() {
                var tree = thisController.lookupReference('mainTreeViewRef');
                var store = tree.getStore();
                var node = store.getNodeById('user_' + thisController.getViewModel().data.loggedInUser.id);
                
                if (node != undefined) {
                    tree.getSelectionModel().select([node]);
                    tree.selectPath(node.getPath());
                    }
                }
            });
        },
    
    expandTree: function() {
        var toolbar = this.lookupReference('bottomTreeToolbarRef');
        var tree = this.lookupReference('mainTreeViewRef');

        toolbar.disable();
        
        tree.expandAll(function() {
            toolbar.enable();
            });
        },
        
    collapseTree: function() {
        var toolbar = this.lookupReference('bottomTreeToolbarRef');
        var tree = this.lookupReference('mainTreeViewRef');
        
        toolbar.disable();
        
        tree.collapseAll(function() {
            toolbar.enable();
            });
        }
    });