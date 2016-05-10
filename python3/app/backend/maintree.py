from flask import request, jsonify

from sql_classes import UrlList, AccessTemplate, UserGroup, User, Role

    
#Returns a tuple: (the substring of a path after the last nodeSeparator, the preceding path before it)
#If 'base' includes its own baseSeparator - return only a string after it
#So if a path is 'OU=Group,OU=Dept,OU=Company', the tuple result would be ('OU=Group,OU=Dept', 'Company')
def _node_base_and_rest(path):
    node_separator = ','
    base_separator = '='

    node_base = path[path.rfind(node_separator) + 1:]

    if path.find(node_separator) != -1:
        node_preceding = path[:len(path) - len(node_base) - 1]
    else:
        node_preceding = ''

    return (node_preceding, node_base[node_base.find(base_separator) + 1:])

#Places a 'user' object on a 'usertree' object according to user's pathField string key
def _place_user_onto_tree(user, usertree, user_groups):
    curr_node = usertree

    #Decompose 'OU=Group,OU=Dept,OU=Company' into ('OU=Group,OU=Dept', 'Company')
    preceding, base = _node_base_and_rest(user['distinguishedName'])
    
    full_node_path = ''

    #Place all path groups onto a tree starting from the outermost
    while base != '':
        node_found = False
        full_node_path = 'OU=' + base + (',' if full_node_path != '' else '') + full_node_path

        #Search for corresponding base element on current hierarchy level
        for obj in curr_node:
            if obj.get('text') == None:
                continue

            if obj['text'] == base:
                node_found = True
                curr_node = obj['children']
                break

        #Create a new group node
        if not node_found:
            curr_node.append({
                'id': 'usergroup_' + str(user_groups[full_node_path]),
                'text': base,
                'objectType': 'UserGroup',
                'children': []
                })

            curr_node = curr_node[len(curr_node) - 1]['children']

        preceding, base = _node_base_and_rest(preceding)

    curr_node.append({
        'id': 'user_' + str(user['id']),
        'text': user['cn'],
        'leaf': True,
        'iconCls': 'x-fa fa-user' if user['status'] == 1 else 'x-fa fa-user-times',
        'objectType': 'User'
        })

#Sorts a subtree node by a sortField key of each element
def _sort_tree(subtree, sort_field):
    #Sort eval function, first by group property, then by text
    subtree['children'] = sorted(subtree['children'],
        key=lambda obj: (1 if obj.get('children') == None else 0, obj[sort_field]))

    for tree_elem in subtree['children']:
        if tree_elem.get('children') != None:
            _sort_tree(tree_elem, sort_field)

#Collapses tree nodes which doesn't contain subgroups, just tree leaves
def _collapse_terminal_nodes(subtree):
    subtree_has_group_nodes = False

    for tree_elem in subtree['children']:
        if tree_elem.get('children') != None:
            subtree_has_group_nodes = True
            _collapse_terminal_nodes(tree_elem)

    subtree['expanded'] = subtree_has_group_nodes
    
#Expand all level nodes
def _expand_all_nodes(subtree):
    for tree_elem in subtree['children']:
        if tree_elem.get('children') != None:
            _expand_all_nodes(tree_elem)

    subtree['expanded'] = True

#Build user tree
def _get_user_tree(current_user_properties, Session):
    current_user_permissions = current_user_properties['user_permissions']
    
    session = Session()

    #Get all groups
    query_result = session.query(UserGroup).all()
    
    user_groups = {}

    for query_result_row in query_result:
        user_groups[query_result_row.distinguishedName] = query_result_row.id
            
    #Get all users if ViewUsers permission present
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) != None: 
        query_result = session.query(User.id.label('user_id'), User.cn, User.status, UserGroup.id.label('usergroup_id'), \
            UserGroup.distinguishedName).join(UserGroup).filter(User.hidden==0).all()
    #Get just the requester otherwise
    else:
        query_result = session.query(User.id.label('user_id'), User.cn, User.status, UserGroup.id.label('usergroup_id'), \
            UserGroup.distinguishedName).join(UserGroup).\
            filter(User.id==current_user_properties['user_object']['id'], User.hidden==0).all()

    session.close()

    #Future tree
    user_tree = []
    
    #Place each user on a tree
    for query_result_row in query_result:
        user_object = {
            'id': query_result_row.user_id,
            'distinguishedName': query_result_row.distinguishedName,
            'status': query_result_row.status,
            'cn': query_result_row.cn
            }
            
        _place_user_onto_tree(user_object, user_tree, user_groups)

    user_tree = {
        'id': 'usergroup_0',
        'objectType': 'UserGroup',
        'text': 'Пользователи',
        'children': user_tree
        }

    #Sorting tree elements
    _sort_tree(user_tree, 'text')

    #Collapsing/expanding tree nodes
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) != None: 
        _collapse_terminal_nodes(user_tree)
    else:
        _expand_all_nodes(user_tree)

    return user_tree

#Get URL lists
def _get_url_lists(Session):
    session = Session()

    #Get all urllists from DB
    query_result = session.query(UrlList).all()

    session.close()
    
    urllist_list = []

    #Making a list of them
    for query_result_row in query_result:
        url_list_object = {
            'id': 'urllist_' + str(query_result_row.id),
            'text': query_result_row.name,
            'leaf': True,
            'iconCls': 'x-fa fa-unlock' if query_result_row.whitelist else 'x-fa fa-lock',
            'objectType': 'UrlList'
            }

        urllist_list.append(url_list_object)

    url_lists = {
        'id': 'urllists',
        'objectType': 'UrlLists',
        'text': 'Списки URL',
        'iconCls': 'x-fa fa-cog',
        'children': urllist_list
        }
        
    #Sorting tree elements
    _sort_tree(url_lists, 'text')

    return url_lists
    
#Get access templates
def _get_access_templates(Session):
    session = Session()

    #Get all access templates from DB
    query_result = session.query(AccessTemplate).all()

    session.close()

    access_templates_list = []

    #Making a list of them
    for query_result_row in query_result:
        access_template_object = {
            'id': 'accesstemplate_' + str(query_result_row.id),
            'text': query_result_row.name,
            'leaf': True,
            'iconCls': 'x-fa fa-filter',
            'objectType': 'AccessTemplateContents'
            }

        access_templates_list.append(access_template_object)

    access_templates = {
        'id': 'accesstemplates',
        'objectType': 'AccessTemplates',
        'text': 'Шаблоны доступа',
        'iconCls': 'x-fa fa-cog',
        'children': access_templates_list
        }
        
    #Sorting tree elements
    _sort_tree(access_templates, 'text')

    return access_templates
    
#Get user roles
def _get_roles(Session):
    session = Session()

    #Get all roles from DB
    query_result = session.query(Role).all()

    session.close()

    roles_list = []

    #Making a list of them
    for query_result_row in query_result:
        role_object = {
            'id': 'role_' + str(query_result_row.id),
            'text': query_result_row.name,
            'leaf': True,
            'iconCls': 'x-fa fa-key',
            'objectType': 'Role'
            }

        roles_list.append(role_object)

    roles = {
        'id': 'roles',
        'objectType': 'Roles',
        'text': 'Роли',
        'iconCls': 'x-fa fa-cog',
        'children': roles_list
        }

    #Sorting tree elements
    _sort_tree(roles, 'text')

    return roles
    

def select_tree(current_user_properties, node_name, Session):     
    url_lists_node = None
    access_templates_node = None
    roles_node = None
    users_node = None
     
    current_user_permissions = current_user_properties['user_permissions']

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewSettings'), None) != None:
        if node_name in ['root', 'urllists']:
            url_lists_node = _get_url_lists(Session)
        
        if node_name in ['root', 'accesstemplates']:
            access_templates_node = _get_access_templates(Session)

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) != None:
        if node_name in ['root', 'roles']:
            roles_node = _get_roles(Session)
  
    if node_name in ['root']:
        users_node = _get_user_tree(current_user_properties, Session)

    if node_name == 'root':
        children_list = []
        
        if url_lists_node != None:
            children_list.append(url_lists_node)
            
        if access_templates_node != None:
            children_list.append(access_templates_node)
            
        if roles_node != None:
            children_list.append(roles_node)
            
        if users_node != None:
            children_list.append(users_node)
        
        result = {
            'success': True,
            'children': children_list
            }
    elif node_name == 'urllists':
        if next((item for item in current_user_permissions if item['permissionName'] == 'ViewSettings'), None) != None:
            result = {
                'success': True,
                'children': url_lists_node['children']
                }
        else:
            return Response('Forbidden', 403)
    elif node_name == 'accesstemplates':
        if next((item for item in current_user_permissions if item['permissionName'] == 'ViewSettings'), None) != None:
            result = {
                'success': True,
                'children': access_templates_node['children']
                }
        else:
            return Response('Forbidden', 403)
    elif node_name == 'roles':
        if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) != None:
            result = {
                'success': True,
                'children': roles_node['children']
                }
        else:
            return Response('Forbidden', 403)

    return jsonify(result)
