from flask import request,jsonify

from sql_classes import Settings

def select_settings(Session):
    session = Session()

    query_result = session.query(Settings).filter_by(id=1).first()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'data':{'id':1}
            })

    settings_object = {
        'id':query_result.id,
        'defaultAccessTemplateId':query_result.defaultAccessTemplateId
        }

    session.close()

    response = {
        'success':True,
        'data':settings_object
        }

    return jsonify(response)

def update_settings(Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success':False,
            'data':'Bad JSON request'
            })

    session = Session()

    query_result = session.query(Settings).get(1)

    if query_result == None:
        new_settings = Settings(id=1)
        session.add(new_settings)
        query_result = session.query(Settings).get(1)

    do_commit = False

    allowed_to_update_fields = ['defaultAccessTemplateId']

    for field_name in allowed_to_update_fields:
        if json_data.get(field_name) != None:
            setattr(query_result,field_name,json_data.get(field_name))
            do_commit = True

    try:
        if do_commit:
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
