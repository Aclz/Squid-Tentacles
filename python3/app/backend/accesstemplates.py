from flask import request, jsonify

from sql_classes import AccessTemplate

def select_accesstemplates(Session):
    session = Session()

    query_result = session.query(AccessTemplate).all()
    
    session.close()

    if query_result == None:
        return jsonify({
            'success': True,
            'data': []
            })

    access_templates_list = []

    for query_result_row in query_result:
        access_template_object = {
            'id': query_result_row.id,
            'name': query_result_row.name
            }

        access_templates_list.append(access_template_object)

    response = {
        'success': True,
        'data': access_templates_list
        }

    return jsonify(response)
    
    
def select_accesstemplate(accesstemplate_id, Session):
    session = Session()

    query_result = session.query(AccessTemplate).get(accesstemplate_id)

    session.close()

    if query_result == None:
        return jsonify({
            'success': True,
            'data': []
            })

    access_template_object = {
        'id': query_result.id,
        'name': query_result.name
        }

    response = {
        'success': True,
        'data': access_template_object
        }

    return jsonify(response)
    
    
def insert_accesstemplate(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_access_template = AccessTemplate(name=json_data.get('name'))

    try:
        session.add(new_access_template)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_access_template.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }

    session.close()

    return jsonify(response)
    
    
def update_accesstemplate(accesstemplate_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(AccessTemplate).get(accesstemplate_id)

    if query_result == None:
        return jsonify(success = False)

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


def delete_accesstemplate(accesstemplate_id, Session):
    session = Session()

    try:
        session.delete(session.query(AccessTemplate).filter_by(id=accesstemplate_id).first())
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
