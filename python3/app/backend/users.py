from flask import request,jsonify

from sql_classes import User

def select_user(user_id,Session):
    session = Session()

    queryResult = session.query(User).filter_by(id=user_id,hidden=0).first()

    if queryResult == None:
        return jsonify(success=False)

    userObject = {
        'id':queryResult.id,
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
    

def update_user(user_id,Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({'success':False,'message':'Bad JSON request'})

    session = Session()

    queryResult = session.query(User).get(user_id)

    if queryResult == None:
        return jsonify(success = False)

    doCommit = False

    allowedToUpdateFields = ['status','quota','authMethod','ip','traffic']

    for fieldName in allowedToUpdateFields:
        if json_data.get(fieldName) != None:
            setattr(queryResult,fieldName,json_data.get(fieldName))
            doCommit = True

    if doCommit:
        session.commit()

    try:
        if doCommit:
            session.commit()

        response = {
            'success':True
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)
