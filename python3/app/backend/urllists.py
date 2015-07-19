from flask import request,jsonify

from sql_classes import UrlList

def select_urllists(Session):
    session = Session()

    query_result = session.query(UrlList).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'urlLists':[]
            })

    url_lists_array = []

    #Making an array of them
    for query_result_row in query_result:
        url_list_object = {
            'id':query_result_row.id,
            'name':query_result_row.name
            }

        url_lists_array.append(url_list_object)

    response = {
        'success':True,
        'urlLists':url_lists_array
        }

    return jsonify(response)
    
    
def insert_urllist(Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({'success':False,'message':'Bad JSON request'})

    session = Session()

    new_url_list = UrlList(name=json_data.get('name'))

    try:
        session.add(new_url_list)
        session.commit()

        response = {
            'success':True,
            'urlLists':[{'id':new_url_list.id}]
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
