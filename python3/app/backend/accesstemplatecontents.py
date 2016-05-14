from flask import request, jsonify

from sql_classes import AccessTemplateContents

def select_accesstemplatecontents(accesstemplate_id, Session):
    session = Session()

    query_result = session.query(AccessTemplateContents).filter_by(accessTemplateId=accesstemplate_id).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success': True,
            'data': []
            })

    access_template_contents_list = []

    for query_result_row in query_result:
        access_template_contents_object = {
            'id': query_result_row.id,
            'urlListId': query_result_row.urlListId,
            'orderNumber': query_result_row.orderNumber
            }

        access_template_contents_list.append(access_template_contents_object)

    response = {
        'success': True,
        'data': access_template_contents_list
        }

    return jsonify(response)
    
    
def insert_accesstemplatecontents(accesstemplate_id, Session):
    json_data = request.get_json()

    if not json_data or json_data.get('urlListId') == None:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    new_access_template_content = AccessTemplateContents(
        accessTemplateId=accesstemplate_id,
        urlListId=json_data.get('urlListId'),
        orderNumber=json_data.get('orderNumber'))

    try:
        session.add(new_access_template_content)
        session.commit()

        response = {
            'success': True,
            'data': [{'id': new_access_template_content.id}]
            }
    except Exception as e:
        response = {
            'success': False
            }

    session.close()

    return jsonify(response)
    
    
def update_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    query_result = session.query(AccessTemplateContents).get(accesstemplatecontent_id)

    if query_result == None:
        return jsonify(success = False)

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

    session.close()

    return jsonify(response)


def delete_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id, Session):
    session = Session()

    try:
        session.delete(session.query(AccessTemplateContents).filter_by(accessTemplateId=accesstemplate_id,
            id=accesstemplatecontent_id).first())
            
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
