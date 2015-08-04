Ext.define('tentacles.view.MainViewController', {
    extend: 'Ext.app.ViewController',
    
    alias: 'controller.mainviewcontroller',
    
    listen: {
        controller: {
            '*': {
                onTreeSelectionChange: 'onTreeSelectionChange'
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
                    
                this.fireEvent('onUserSelect',args.selected.data.id.replace('user_',''));

                break;    
            case 'UserGroup':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'usergroupformview') {
                            
                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.UserGroupFormView());
                    }
                    
                this.fireEvent('onUserGroupSelect',args.selected.data.id.replace('usergroup_',''));
                        
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
                
                this.fireEvent('onUrlListSelect',args.selected.data.id.replace('urllist_',''));

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

                this.fireEvent('onAccessTemplateContentsSelect',args.selected.data.id.replace('accesstemplate_',''));

                break;
            case 'Settings':
                if (!this.lookupReference('detailsPanelRef').items.items[0] ||
                    this.lookupReference('detailsPanelRef').items.items[0].xtype != 'settingsformview') {

                    this.lookupReference('detailsPanelRef').removeAll();
                    this.lookupReference('detailsPanelRef').add(new tentacles.view.SettingsFormView());
                    }

                this.fireEvent('onSettingsSelect');

                break;
            default:
                this.lookupReference('detailsPanelRef').removeAll();
                
                break;
            }        
        },
    
    beforeTreeSelect: function(model,selected) {        
        //If there is a child form in the right frame, first signal it about the selection change intention
        //and exit (do not change selection for now)
        if (this.lookupReference('detailsPanelRef').items.length != 0) {
            this.fireEvent('beforeTreeSelectionChange',{selected: selected});
            }
        else {
            this.onTreeSelectionChange({selected: selected});
            }
        },
    
    onUrlListReloadRequest: function () {
        var urlListsRootNode = this.getStore('maintreestore').getRootNode().findChildBy(
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
            
            this.getViewModel().getStore('maintreestore').load({
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
        var accessTemplatesRootNode = this.getStore('maintreestore').getRootNode().findChildBy(
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

            this.getViewModel().getStore('maintreestore').load({
                node: accessTemplatesRootNode,

                callback: function() {
                    if (!isNodeExpanded) {
                        accessTemplatesRootNode.collapse();
                        }
                    }
                });
            };
        }
    });