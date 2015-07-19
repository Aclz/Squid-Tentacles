from flask import request,jsonify

from sql_classes import AccessTemplate

def select_accesstemplates(Session):
    session = Session()

    query_result = session.query(AccessTemplate).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'accessTemplates':[]
            })

    access_templates_array = []

    #Making an array of them
    for query_result_row in query_result:
        access_template_object = {
            'id':query_result_row.id,
            'name':query_result_row.name
            }

        access_templates_array.append(access_template_object)

    response = {
        'success':True,
        'accessTemplates':access_templates_array
        }

    return jsonify(response)
    
    
def insert_accesstemplate(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({'success':False,'message':'Bad JSON request'})

    session = Session()

    new_access_template = AccessTemplate(name=json_data.get('name'))

    try:
        session.add(new_access_template)
        session.commit()

        response = {
            'success':True,
            'accessTemplates':[{'id':new_access_template.id}]
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)


def delete_accesstemplate(accesstemplate_id,Session):
    session = Session()

    try:
        session.delete(session.query(AccessTemplate).filter_by(id=accesstemplate_id).first())
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
