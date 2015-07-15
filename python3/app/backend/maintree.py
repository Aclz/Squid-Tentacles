from flask import request,jsonify

from sql_classes import UrlList,UserGroup,User

def select_tree(node_name,Session):
    #Returns a tuple: (the substring of a path after the last nodeSeparator,the preceding path before it)
    #If 'base' includes its own baseSeparator - return only a string after it
    #So if path is 'OU=Group,OU=Dept,OU=Company', the queryResult would be 'Company',
    #and the 'rest' would be 'OU=Group,OU=Dept'
    def node_base_and_rest(path):
        nodeSeparator = ','
        baseSeparator = '='

        nodeBase = path[path.rfind(nodeSeparator) + 1:]

        if path.find(nodeSeparator) != -1:
            nodePreceding = path[:len(path) - len(nodeBase) - 1]
        else:
            nodePreceding = ''

        return (nodePreceding,nodeBase[nodeBase.find(baseSeparator) + 1:])

    #Places a 'user' object on a 'usertree' object according to user's pathField string key
    def place_user_onto_tree(user,usertree,pathField):
        currNode = usertree

        preceding,base=node_base_and_rest(user[pathField])

        while base != '':
            nodeFound = False

            #Searching for corresponding base element on current hierarchy level
            for obj in currNode:
                if obj.get('text') == None:
                    continue

                if obj['text'] == base:
                    nodeFound = True
                    currNode = obj['children']
                    break

            #Creating a new group node
            if nodeFound == False:
                currNode.append({
                    'id':user[pathField][len(preceding) + (0 if len(preceding) == 0 else 1):],
                    'text':base,
                    'objectType':'UserGroup',
                    'children':[]
                    })

                currNode = currNode[len(currNode) - 1]['children']

            preceding,base = node_base_and_rest(preceding)

        currNode.append({
            'id':user['id'],
            'text':user['cn'],
            'leaf':True,
            'objectType':'User'
            })

    #Sorts a subtree node by a sortField key of each element
    def sort_tree(subtree,sortField):
        #Sort eval function, first by group property, then by text
        def sort_by_field_helper(obj):
            return (1 if obj.get('children') == None else 0,obj[sortField])

        subtree['children'] = sorted(subtree['children'],key=sort_by_field_helper)

        for treeElem in subtree['children']:
            if treeElem.get('children') != None:
                sort_tree(treeElem,sortField)

    #Collapses tree nodes which doesn't contain subgroups, just tree leaves
    def collapse_terminal_nodes(subtree):
        subtreeHasGroupNodes=False

        for treeElem in subtree['children']:
            if treeElem.get('children') != None:
                subtreeHasGroupNodes = True
                collapse_terminal_nodes(treeElem)

        subtree['expanded'] = subtreeHasGroupNodes

    #Build user tree
    def get_user_tree():
        session = Session()

        #Get all users from DB
        queryResult = session.query(User.id,User.cn,UserGroup.distinguishedName).join(UserGroup).filter(User.hidden==0).all()

        session.close()

        userArray = []

        #Making an array of them
        for queryResultRow in queryResult:
            user_object = {
                'id':queryResultRow.id,
                'distinguishedName':queryResultRow.distinguishedName,
                'cn':queryResultRow.cn
                }

            userArray.append(user_object)

        userTree = []

        #Building a hierarchial tree based on the path given in distinguishedName
        for user in userArray:
            place_user_onto_tree(user,userTree,'distinguishedName')

        userTree = {
            'id':'usertree',
            'objectType':'UserTree',
            'text':'Пользователи',
            'children':userTree
            }

        #Sorting tree elements
        sort_tree(userTree,'text')

        #Collapsing tree nodes
        collapse_terminal_nodes(userTree)

        return userTree

    #Get URL lists
    def get_url_lists():
        session = Session()

        #Get all urllists from DB
        queryResult = session.query(UrlList).all()

        session.close()

        urlListArray = []

        #Making an array of them
        for queryResultRow in queryResult:
            url_list_object = {
                'id':queryResultRow.id,
                'text':queryResultRow.name,
                'leaf':True,
                'objectType':'UrlList'
                }

            urlListArray.append(url_list_object)

        urlLists = {
            'id':'urllists',
            'objectType':'UrlLists',
            'text':'Списки URL',
            'children':urlListArray
            }

        return urlLists


    if request.method == 'GET':
        if node_name in ['root','urllists']:
            url_lists_node = get_url_lists()
            
        if node_name in ['root']:
            users_node = get_user_tree()

        if node_name == 'root':
            result = {
                'success':True,
                'children':[url_lists_node,users_node]
                }
        elif node_name == 'urllists':
            url_lists_node['success'] = True
            result = url_lists_node

        return jsonify(result)
