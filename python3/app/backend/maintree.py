from flask import request,jsonify

from sql_classes import UrlList,AccessTemplate,UserGroup,User

def select_tree(node_name,Session):
    #Returns a tuple: (the substring of a path after the last nodeSeparator,the preceding path before it)
    #If 'base' includes its own baseSeparator - return only a string after it
    #So if path is 'OU=Group,OU=Dept,OU=Company', the queryResult would be 'Company',
    #and the 'rest' would be 'OU=Group,OU=Dept'
    def node_base_and_rest(path):
        node_separator = ','
        base_separator = '='

        node_base = path[path.rfind(node_separator) + 1:]

        if path.find(node_separator) != -1:
            node_preceding = path[:len(path) - len(node_base) - 1]
        else:
            node_preceding = ''

        return (node_preceding,node_base[node_base.find(base_separator) + 1:])

    #Places a 'user' object on a 'usertree' object according to user's pathField string key
    def place_user_onto_tree(user,usertree,path_field):
        curr_node = usertree

        preceding,base=node_base_and_rest(user[path_field])

        while base != '':
            node_found = False

            #Searching for corresponding base element on current hierarchy level
            for obj in curr_node:
                if obj.get('text') == None:
                    continue

                if obj['text'] == base:
                    node_found = True
                    curr_node = obj['children']
                    break

            #Creating a new group node
            if node_found == False:
                curr_node.append({
                    'id':'usergroup_' + user[path_field][len(preceding) + (0 if len(preceding) == 0 else 1):],
                    'text':base,
                    'objectType':'UserGroup',
                    'children':[]
                    })

                curr_node = curr_node[len(curr_node) - 1]['children']

            preceding,base = node_base_and_rest(preceding)

        curr_node.append({
            'id':'user_' + str(user['id']),
            'text':user['cn'],
            'leaf':True,
            'objectType':'User'
            })

    #Sorts a subtree node by a sortField key of each element
    def sort_tree(subtree,sort_field):
        #Sort eval function, first by group property, then by text
        def sort_by_field_helper(obj):
            return (1 if obj.get('children') == None else 0,obj[sort_field])

        subtree['children'] = sorted(subtree['children'],key=sort_by_field_helper)

        for tree_elem in subtree['children']:
            if tree_elem.get('children') != None:
                sort_tree(tree_elem,sort_field)

    #Collapses tree nodes which doesn't contain subgroups, just tree leaves
    def collapse_terminal_nodes(subtree):
        subtree_has_group_nodes = False

        for tree_elem in subtree['children']:
            if tree_elem.get('children') != None:
                subtree_has_group_nodes = True
                collapse_terminal_nodes(tree_elem)

        subtree['expanded'] = subtree_has_group_nodes

    #Build user tree
    def get_user_tree():
        session = Session()

        #Get all users from DB
        query_result = session.query(User.id,User.cn,UserGroup.distinguishedName).join(UserGroup).filter(User.hidden==0).all()

        session.close()

        user_array = []

        #Making an array of them
        for query_result_row in query_result:
            user_object = {
                'id':query_result_row.id,
                'distinguishedName':query_result_row.distinguishedName,
                'cn':query_result_row.cn
                }

            user_array.append(user_object)

        user_tree = []

        #Building a hierarchial tree based on the path given in distinguishedName
        for user in user_array:
            place_user_onto_tree(user,user_tree,'distinguishedName')

        user_tree = {
            'id':'usertree',
            'objectType':'UserTree',
            'text':'Пользователи',
            'children':user_tree
            }

        #Sorting tree elements
        sort_tree(user_tree,'text')

        #Collapsing tree nodes
        collapse_terminal_nodes(user_tree)

        return user_tree

    #Get URL lists
    def get_url_lists():
        session = Session()

        #Get all urllists from DB
        query_result = session.query(UrlList).all()

        session.close()

        url_list_array = []

        #Making an array of them
        for query_result_row in query_result:
            url_list_object = {
                'id':'urllist_' + str(query_result_row.id),
                'text':query_result_row.name,
                'leaf':True,
                'objectType':'UrlList'
                }

            url_list_array.append(url_list_object)

        url_lists = {
            'id':'urllists',
            'objectType':'UrlLists',
            'text':'Списки URL',
            'children':url_list_array
            }

        return url_lists
        
    #Get access templates
    def get_access_templates():
        session = Session()

        #Get all access templates from DB
        query_result = session.query(AccessTemplate).all()

        session.close()

        access_templates_array = []

        #Making an array of them
        for query_result_row in query_result:
            access_template_object = {
                'id':'accesstemplate_' + str(query_result_row.id),
                'text':query_result_row.name,
                'leaf':True,
                'objectType':'AccessTemplateContents'
                }

            access_templates_array.append(access_template_object)

        access_templates = {
            'id':'accesstemplates',
            'objectType':'AccessTemplates',
            'text':'Шаблоны доступа',
            'children':access_templates_array
            }

        return access_templates
        
    #Get settings node
    def get_settings():
        settings = {
            'id':'settings',
            'objectType':'Settings',
            'text':'Общие настройки',
            'leaf':True
            }

        return settings

    if request.method == 'GET':
        if node_name in ['root','urllists']:
            url_lists_node = get_url_lists()
            
        if node_name in ['root','accesstemplates']:
            access_templates_node = get_access_templates()
            
        if node_name in ['root']:
            settings_node = get_settings()
            users_node = get_user_tree()

        if node_name == 'root':
            result = {
                'success':True,
                'children':[settings_node,url_lists_node,access_templates_node,users_node]
                }
        elif node_name == 'urllists':
            result = {
                'success':True,
                'children':url_lists_node['children']
                }
        elif node_name == 'accesstemplates':
            result = {
                'success':True,
                'children':access_templates_node['children']
                }

        return jsonify(result)
