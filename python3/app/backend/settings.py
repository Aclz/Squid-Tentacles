from flask import request, jsonify

from sql_classes import Settings


def select_settings(current_user_properties, Session):
    session = Session()

    query_result = session.query(Settings).first()

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': {
                'id': 1
                }
            })

    settings_object = {
        'id': query_result.id,
        'defaultAclId': query_result.defaultAclId,
        'defaultRoleId': query_result.defaultRoleId
        }

    session.close()

    current_user_permissions = current_user_properties['user_permissions']

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) == None:
        forbidden_items = ['defaultRoleId']

        for item in forbidden_items:
            if settings_object.get(item) != None:
                settings_object.pop(item)

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewSettings'), None) == None:
        forbidden_items = ['defaultAclId']

        for item in forbidden_items:
            if settings_object.get(item) != None:
                settings_object.pop(item)

    response = {
        'success': True,
        'data': settings_object
        }

    return jsonify(response)


def update_settings(Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'data': 'Bad JSON request'
            })

    session = Session()

    query_result = session.query(Settings).first()

    if query_result is None:
        new_settings = Settings()
        session.add(new_settings)
        query_result = session.query(Settings).first()

    do_commit = False

    allowed_to_update_fields = ['defaultAclId', 'defaultRoleId']

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
    finally:
        session.close()

    return jsonify(response)
