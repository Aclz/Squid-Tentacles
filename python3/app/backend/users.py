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
        'extraQuota': query_result.extraQuota,
        'authMethod': query_result.authMethod,
        'ip': query_result.ip if query_result.ip != None else '0.0.0.0',
        'traffic': round(query_result.traffic/1024/1024, 2),
        'aclId': query_result.aclId,
        'roleId': query_result.roleId
        }
            
    current_user_permissions = current_user_properties['user_permissions']
    
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) == None:
        forbidden_items = ['authMethod', 'ip', 'aclId', 'roleId']
        
        if requested_user_id != current_user_properties['user_object']['id']:
            forbidden_items.extend(['status', 'quota', 'extraQuota', 'traffic'])
        
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
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()
    
    ip_to_set = json_data.get('ip')
    
    if ip_to_set != None and ip_to_set != '0.0.0.0':
        query_result = session.query(User).filter(User.ip == ip_to_set, User.id != user_id).first()
        
        if query_result != None:
            return jsonify({
                'success': False,
                'message': 'IP_NOT_UNIQUE:' + query_result.cn + ' (' + query_result.userPrincipalName + ')'
                })

    query_result = session.query(User).get(user_id)

    if query_result == None:
        return jsonify(success = False)

    do_commit = False

    allowed_to_update_fields = ['status', 'quota', 'extraQuota', 'authMethod', 'ip', 'traffic', 'aclId', 'roleId']

    for field_name in allowed_to_update_fields:
        if json_data.get(field_name) != None:
            if field_name == 'ip' and json_data.get(field_name) == '0.0.0.0':
                continue
                
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
