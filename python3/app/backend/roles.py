from flask import request, jsonify

from sql_classes import Role


def select_roles(Session):
    session = Session()

    query_result = session.query(Role).all()

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    roles_list = []

    for query_result_row in query_result:
        role_object = {
            'id': query_result_row.id,
            'name': query_result_row.name
            }

        roles_list.append(role_object)

    response = {
        'success': True,
        'data': roles_list
        }

    return jsonify(response)


def select_role(role_id, Session):
    session = Session()

    query_result = session.query(Role).get(role_id)

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    role_object = {
        'id': query_result.id,
        'name': query_result.name
        }

    response = {
        'success': True,
        'data': role_object
        }

    return jsonify(response)


def insert_role(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_role = Role(name=json_data.get('name'))

    try:
        session.add(new_role)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_role.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }

    session.close()

    return jsonify(response)


def update_role(role_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(Role).get(role_id)

    if query_result is None:
        return jsonify(success=False)

    do_commit = False

    allowed_to_update_fields = ['name']

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


def delete_role(role_id, Session):
    session = Session()

    try:
        session.delete(session.query(Role).filter_by(id=role_id).first())
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
