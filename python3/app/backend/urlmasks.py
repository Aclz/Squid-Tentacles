from flask import request, jsonify

from sql_classes import UrlMask


def select_urlmasks(urllist_id, Session):
    session = Session()

    query_result = session.query(UrlMask).filter_by(urlListId=urllist_id).all()

    session.close()

    if query_result is None:
        return jsonify({
            'success': True,
            'data': []
            })

    url_mask_list = []

    for query_result_row in query_result:
        url_list_mask_object = {
            'id': query_result_row.id,
            'name': query_result_row.name
            }

        url_mask_list.append(url_list_mask_object)

    response = {
        'success': True,
        'data': url_mask_list
        }

    return jsonify(response)


def insert_urlmask(urllist_id, Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_url_mask = UrlMask(urlListId=urllist_id, name=json_data.get('name'))

    try:
        session.add(new_url_mask)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_url_mask.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }

    session.close()

    return jsonify(response)


def update_urlmask(urllist_id, urlmask_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(UrlMask).filter_by(urlListId=urllist_id, id=urlmask_id).first()

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


def delete_urlmask(urllist_id, urlmask_id, Session):
    session = Session()

    try:
        session.delete(session.query(UrlMask).filter_by(urlListId=urllist_id, id=urlmask_id).first())
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
