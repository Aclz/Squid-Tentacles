from flask import request, jsonify

from sql_classes import User


def select_user(current_user_properties, requested_user_id, Session):
    session = Session()

    query_result = session.query(User).filter_by(id = requested_user_id, hidden = 0).first()
    
    session.close()

    if query_result == None:
        return jsonify(success = False)

    requested_user_object = {
        'id': query_result.id,
        'cn': query_result.cn,
        'userPrincipalName': query_result.userPrincipalName,
        'status': query_result.status,
        'quota': query_result.quota,
        'authMethod': query_result.authMethod,
        'ip': query_result.ip,
        'traffic': round(query_result.traffic/1024/1024, 2),
        'accessTemplateId': query_result.accessTemplateId,
        'roleId': query_result.roleId
        }
            
    current_user_permissions = current_user_properties['user_permissions']
    
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) == None:
        forbidden_items = ['authMethod', 'ip', 'accessTemplateId', 'roleId']
        
        if requested_user_id != current_user_properties['user_object']['id']:
            forbidden_items.extend(['status', 'quota', 'traffic'])
        
        for item in forbidden_items:
            if requested_user_object.get(item) != None:
                requested_user_object.pop(item)
                
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) == None:
        forbidden_items = ['roleId']

        for item in forbidden_items:
            if requested_user_object.get(item) != None:
                requested_user_object.pop(item)

    response = {
        'success': True,
        'data': requested_user_object
        }

    return jsonify(response)
    

def update_user(user_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'Bad JSON request'
            })

    session = Session()

    query_result = session.query(User).get(user_id)

    if query_result == None:
        return jsonify(success = False)

    do_commit = False

    allowed_to_update_fields = ['status', 'quota', 'authMethod', 'ip', 'traffic', 'accessTemplateId', 'roleId']

    for field_name in allowed_to_update_fields:
        if json_data.get(field_name) != None:
            setattr(query_result, field_name, json_data.get(field_name))
            do_commit = True

    try:
        if do_commit:
            session.commit()

        response = {
            'success': True
            }
    except Exception as e:
        response = {
            'success': False
            }

    session.close()

    return jsonify(response)
