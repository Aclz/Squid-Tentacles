from flask import request, jsonify

from sql_classes import RolePermission


def select_role_permissions(role_id, Session):
    session = Session()

    query_result = session.query(RolePermission.id, RolePermission.permissionId).filter_by(roleId=role_id).all()

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    role_permissions_list = []

    for query_result_row in query_result:
        role_permission_object = {
            'id': query_result_row.id,
            'permissionId': query_result_row.permissionId
            }

        role_permissions_list.append(role_permission_object)

    response = {
        'success': True,
        'data': role_permissions_list
        }

    return jsonify(response)


def insert_role_permissions(role_id, Session):
    json_data = request.get_json()

    if not json_data or json_data.get('permissionId') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_role_permission = RolePermission(roleId=role_id, permissionId=json_data.get('permissionId'))

    try:
        session.add(new_role_permission)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_role_permission.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        session.close()

    return jsonify(response)


def delete_role_permission(role_id, permission_id, Session):
    session = Session()

    try:
        session.delete(session.query(RolePermission).filter_by(roleId=role_id, id=permission_id).first())

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
