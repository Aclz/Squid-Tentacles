from flask import request, jsonify

from sql_classes import AclContents


def select_acl_contents(acl_id, Session):
    session = Session()

    query_result = session.query(AclContents.id, AclContents.urlListId, AclContents.orderNumber).\
        filter_by(aclId=acl_id).all()

    Session.remove()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    acl_contents_list = []

    for query_result_row in query_result:
        acl_contents_object = {
            'id': query_result_row.id,
            'urlListId': query_result_row.urlListId,
            'orderNumber': query_result_row.orderNumber
            }

        acl_contents_list.append(acl_contents_object)

    response = {
        'success': True,
        'data': acl_contents_list
        }

    return jsonify(response)


def insert_acl_contents(acl_id, Session):
    json_data = request.get_json()

    if not json_data or json_data.get('urlListId') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_acl_content = AclContents(
        aclId=acl_id,
        urlListId=json_data.get('urlListId'),
        orderNumber=json_data.get('orderNumber'))

    try:
        session.add(new_acl_content)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_acl_content.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        Session.remove()

    return jsonify(response)


def update_acl_contents(acl_id, aclcontent_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(AclContents).get(aclcontent_id)

    if query_result is None:
        return jsonify(success=False)

    do_commit = False

    allowed_to_update_fields = ['orderNumber']

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
        Session.remove()

    return jsonify(response)


def delete_acl_contents(acl_id, aclcontent_id, Session):
    session = Session()

    try:
        session.delete(session.query(AclContents).filter_by(aclId=acl_id, id=aclcontent_id).first())

        session.commit()

        response = {
            'success': True
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        Session.remove()

    return jsonify(response)
