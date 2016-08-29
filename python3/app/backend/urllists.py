from flask import request, jsonify

from sql_classes import UrlList


def select_urllists(Session):
    session = Session()

    query_result = session.query(UrlList.id, UrlList.name, UrlList.whitelist).all()

    Session.remove()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    urllists_list = []

    for query_result_row in query_result:
        url_list_object = {
            'id': query_result_row.id,
            'name': query_result_row.name,
            'whitelist': True if query_result_row.whitelist == 1 else False
            }

        urllists_list.append(url_list_object)

    response = {
        'success': True,
        'data': urllists_list
        }

    return jsonify(response)


def select_urllist(urllist_id, Session):
    session = Session()

    query_result = session.query(UrlList).get(urllist_id)

    Session.remove()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    url_lists_object = {
        'id': query_result.id,
        'name': query_result.name,
        'whitelist': True if query_result.whitelist == 1 else False
        }

    response = {
        'success': True,
        'data': url_lists_object
        }

    return jsonify(response)


def insert_urllist(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_url_list = UrlList(name=json_data.get('name'), whitelist=0)

    try:
        session.add(new_url_list)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_url_list.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        Session.remove()

    return jsonify(response)


def update_urllist(urllist_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(UrlList).get(urllist_id)

    if query_result is None:
        return jsonify(success=False)

    do_commit = False

    allowed_to_update_fields = ['name', 'whitelist']

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


def delete_urllist(urllist_id, Session):
    session = Session()

    try:
        session.delete(session.query(UrlList).get(urllist_id))
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
