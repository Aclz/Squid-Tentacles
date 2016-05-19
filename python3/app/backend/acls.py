from flask import request, jsonify

from sql_classes import Acl


def select_acls(Session):
    session = Session()

    query_result = session.query(Acl.id, Acl.name).all()

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    acl_list = []

    for query_result_row in query_result:
        acl_object = {
            'id': query_result_row.id,
            'name': query_result_row.name
            }

        acl_list.append(acl_object)

    response = {
        'success': True,
        'data': acl_list
        }

    return jsonify(response)


def select_acl(acl_id, Session):
    session = Session()

    query_result = session.query(Acl).get(acl_id)

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    acl_object = {
        'id': query_result.id,
        'name': query_result.name
        }

    response = {
        'success': True,
        'data': acl_object
        }

    return jsonify(response)


def insert_acl(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_acl = Acl(name=json_data.get('name'))

    try:
        session.add(new_acl)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_acl.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        session.close()

    return jsonify(response)


def update_acl(acl_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(Acl).get(acl_id)

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
    finally:
        session.close()

    return jsonify(response)


def delete_acl(acl_id, Session):
    session = Session()

    try:
        session.delete(session.query(Acl).get(acl_id))
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
