from flask import request,jsonify

from sql_classes import AccessTemplateContents

def select_accesstemplatecontents(accesstemplate_id,Session):
    session = Session()

    query_result = session.query(AccessTemplateContents).filter_by(accessTemplateId=accesstemplate_id).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'data':[]
            })

    access_template_contents_array = []

    #Making an array of them
    for query_result_row in query_result:
        access_template_contents_object = {
            'id':query_result_row.id,
            'urlListId':query_result_row.urlListId
            }

        access_template_contents_array.append(url_list_mask_object)

    response = {
        'success':True,
        'data':access_template_contents_array
        }

    return jsonify(response)
    
    
def insert_accesstemplatecontents(accesstemplate_id,Session):
    json_data = request.get_json()

    if not json_data or json_data.get('urlListId') == None:
        return jsonify({
            'success':False,
            'message':'Bad JSON request'
            })

    session = Session()

    new_access_template_content = AccessTemplateContents(accessTemplateId=accesstemplate_id,urlListId=json_data.get('urlListId'))

    try:
        session.add(new_access_template_content)
        session.commit()

        response = {
            'success':True,
            'data':[{'id':new_access_template_content.id}]
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)


def delete_accesstemplatecontents(accesstemplate_id,accesstemplatecontent_id,Session):
    session = Session()

    try:
        session.delete(session.query(AccessTemplateContents).filter_by(accessTemplateId=accesstemplate_id,
            id=accesstemplatecontent_id).first())
            
        session.commit()

        response = {
            'success':True
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)
