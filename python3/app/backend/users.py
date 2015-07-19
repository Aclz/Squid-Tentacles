from flask import request,jsonify

from sql_classes import User

def select_user(user_id,Session):
    session = Session()

    query_result = session.query(User).filter_by(id=user_id,hidden=0).first()

    if query_result == None:
        return jsonify(success = False)

    user_object = {
        'id':query_result.id,
        'cn':query_result.cn,
        'userPrincipalName':query_result.userPrincipalName,
        'status':query_result.status,
        'quota':query_result.quota,
        'authMethod' :query_result.authMethod,
        'ip':query_result.ip,
        'traffic':round(query_result.traffic/1024/1024,2)
        }

    session.close()

    response = {
        'success':True,
        'user':user_object
        }

    return jsonify(response)
    

def update_user(user_id,Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({'success':False,'message':'Bad JSON request'})

    session = Session()

    query_result = session.query(User).get(user_id)

    if query_result == None:
        return jsonify(success = False)

    do_commit = False

    allowed_to_update_fields = ['status','quota','authMethod','ip','traffic']

    for field_name in allowed_to_update_fields:
        if json_data.get(field_name) != None:
            setattr(query_result,field_name,json_data.get(field_name))
            do_commit = True

    if do_commit:
        session.commit()

    try:
        if do_commit:
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
