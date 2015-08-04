from flask import request,jsonify

from sql_classes import UrlList

def select_urllists(Session):
    session = Session()

    query_result = session.query(UrlList).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'data':[]
            })

    url_lists_array = []

    #Making an array of them
    for query_result_row in query_result:
        url_list_object = {
            'id':query_result_row.id,
            'name':query_result_row.name,
            'whitelist':True if query_result_row.whitelist == 1 else False
            }

        url_lists_array.append(url_list_object)

    response = {
        'success':True,
        'data':url_lists_array
        }

    return jsonify(response)
    
    
def select_urllist(urllist_id,Session):
    session = Session()

    query_result = session.query(UrlList).get(urllist_id)

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'data':[]
            })

    url_lists_object = {
        'id':query_result.id,
        'name':query_result.name,
        'whitelist':True if query_result.whitelist == 1 else False
        }

    response = {
        'success':True,
        'data':url_lists_object
        }

    return jsonify(response)
    
    
def insert_urllist(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({
            'success':False,
            'message':'Bad JSON request'
            })

    session = Session()

    new_url_list = UrlList(name=json_data.get('name'),whitelist=0)

    try:
        session.add(new_url_list)
        session.commit()

        response = {
            'success':True,
            'data':[{'id':new_url_list.id}]
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)
    

def update_urllist(urllist_id,Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success':False,
            'message':'Bad JSON request'
            })

    session = Session()

    query_result = session.query(UrlList).get(urllist_id)

    if query_result == None:
        return jsonify(success = False)

    do_commit = False

    allowed_to_update_fields = ['name','whitelist']

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


def delete_urllist(urllist_id,Session):
    session = Session()

    try:
        session.delete(session.query(UrlList).filter_by(id=urllist_id).first())
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
