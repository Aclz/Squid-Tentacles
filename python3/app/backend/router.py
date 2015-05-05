#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
RESTful Flask backend for Ext JS frontend
"""

import datetime
import time

from flask import Flask,request,jsonify

from sqlalchemy import create_engine,func
from sqlalchemy.sql import label
from sqlalchemy.orm import scoped_session,sessionmaker

from config import config
from sql_classes import Group,User,AccessLogArchive,AccessLog


app = Flask(__name__)

engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))


@app.route('/rest/users/<int:user_id>',methods=['GET','PUT'])
def user(user_id):
    if request.method == 'GET':
        session = Session()

        queryResult = session.query(User).filter_by(id=user_id,hidden=0).first()

        if queryResult == None:
            return jsonify(success=False)

        userObject = {
            'objectId':queryResult.id,
            'cn':queryResult.cn,
            'userPrincipalName':queryResult.userPrincipalName,
            'status':queryResult.status,
            'quota':queryResult.quota,
            'authMethod' :queryResult.authMethod,
            'ip':queryResult.ip,
            'traffic':round(queryResult.traffic/1024/1024,2)
            }

        session.close()

        response = {
            'success':True,
            'user':userObject
            }

        return jsonify(response)

    if request.method == 'PUT':
        json_data = request.get_json()

        if not json_data:
            return jsonify({'success':False,'message':'Bad JSON request'})

        session = Session()

        queryResult = session.query(User).get(user_id)

        if queryResult == None:
            return jsonify(success=False)

        doCommit = False

        allowedToUpdateFields = ['status','quota','authMethod','ip','traffic']

        for fieldName in allowedToUpdateFields:
            if json_data.get(fieldName) != None:
                setattr(queryResult,fieldName,json_data.get(fieldName))
                doCommit = True

        if doCommit:
            session.commit()

        session.close()

        return jsonify(success=True)


@app.route('/rest/tree', methods=['GET'])
def tree():
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
                    'objectId':user[pathField][len(preceding) + (0 if len(preceding)==0 else 1):],
                    'text':base,
                    'objectType':'UserGroup',
                    'children':[]
                    })

                currNode = currNode[len(currNode) - 1]['children']

            preceding,base = node_base_and_rest(preceding)

        currNode.append({'objectId':user['id'],'text':user['cn'],'leaf':True,'objectType':'User'})
    
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
        results = session.query(User.id,User.cn,Group.distinguishedName).join(Group).filter(User.hidden==0).all()

        session.close()

        userArray = []

        #Making an array of them
        for queryResult in results:
            user_object = {
                'id':queryResult.id,
                'distinguishedName':queryResult.distinguishedName,
                'cn':queryResult.cn
                }

            userArray.append(user_object)

        userTree=[]

        #Building a hierarchial tree based on the path given in distinguishedName
        for user in userArray:
            place_user_onto_tree(user,userTree,'distinguishedName')

        userTree = {
            'objectType':'userTree',
            'text':'Пользователи',
            'children':userTree
            }

        #Sorting tree elements
        sort_tree(userTree,'text')

        #Collapsing tree nodes
        collapse_terminal_nodes(userTree)

        return userTree

    def get_url_lists():
        urlLists = {
            'objectType':'urlLists',
            'text':'Списки URL',
            'children':[]
            }

        return urlLists

    def get_access_templates():
        accessTemplates = {
            'objectType':'accessTemplates',
            'text':'Шаблоны доступа',
            'children':[]
            }

        return accessTemplates

    if request.method == 'GET':
        urlLists = get_url_lists()
        accessTemplates = get_access_templates()
        userTree = get_user_tree()

        result = {
            'success':True,
            'children':[
                urlLists,
                accessTemplates,
                userTree
                ]
            }

        return jsonify(result)


@app.route('/rest/reports/user-traffic-by-hosts', methods=['GET'])
def report_user_traffic_by_hosts():
    if request.method == 'GET':
        mandatoryParams = ['userId','dateBeg','dateEnd','limit']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        if request.args.get('limit') == '0':
            queryResult = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(func.sum(AccessLogArchive.traffic).desc()).all()
        else:
            queryResult = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))

        if queryResult == None:
            return jsonify(success=False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'position':len(resultArray) + 1,
                'host':resultRow.host,
                'traffic':float(round(resultRow.traffic/1024/1024,2))
                }

            resultArray.append(rowObject)

        response={
            'success':True,
            'items':resultArray
            }

        return jsonify(response)


@app.route('/rest/reports/user-traffic-by-dates', methods=['GET'])
def report_user_traffic_by_dates():
    if request.method == 'GET':
        mandatoryParams = ['userId','dateBeg','dateEnd']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        queryResult = session.query(AccessLogArchive.date,
            label('traffic',func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.userId == request.args.get('userId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.date).order_by(
            AccessLogArchive.date).all()

        if queryResult == None:
            return jsonify(success=False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'position':len(resultArray) + 1,
                'date':resultRow.date.isoformat(),
                'traffic':float(round(resultRow.traffic/1024/1024,2))
                }

            resultArray.append(rowObject)

        response = {
            'success':True,
            'items':resultArray
            }

        return jsonify(response)


@app.route('/rest/reports/user-day-traffic', methods=['GET'])
def report_user_day_traffic():
    if request.method == 'GET':
        mandatoryParams = ['userId','date','start','limit']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        queryResult = session.query(AccessLog).filter(
            AccessLog.userId == request.args.get('userId'),
            AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()),
            AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
            AccessLog.http_reply_size > 0.05*1024,
            AccessLog.http_status_code.like('2%')).order_by(
            AccessLog.time_since_epoch)

        rowCount = queryResult.count()
        
        queryResult = queryResult.offset(request.args.get('start')).limit(request.args.get('limit'))

        if queryResult == None:
            return jsonify(success = False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'id':len(resultArray) + 1 + int(request.args.get('start')),
                'time':datetime.datetime.fromtimestamp(resultRow.time_since_epoch).isoformat(),
                'url':resultRow.http_url,
                'traffic':float(round(resultRow.http_reply_size/1024,1))
                }

            resultArray.append(rowObject)

        response = {
            'success':True,
            'total':rowCount,
            'items':resultArray
            }

        return jsonify(response)


if __name__ == '__main__':
    app.run(debug = True,host=config['Network']['WebInterfaceIpAddress'],port=8080)