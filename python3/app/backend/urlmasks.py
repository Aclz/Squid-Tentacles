from flask import request,jsonify

from sql_classes import UrlMask

def select_urlmasks(urllist_id,Session):
    session = Session()

    query_result = session.query(UrlMask).filter_by(urlListId=urllist_id).all()

    session.close()

    if query_result == None:
        return jsonify({
            'success':True,
            'urlMasks':[]
            })

    url_mask_array = []

    #Making an array of them
    for query_result_row in query_result:
        url_list_mask_object = {
            'id':query_result_row.id,
            'name':query_result_row.name
            }

        url_mask_array.append(url_list_mask_object)

    response = {
        'success':True,
        'urlMasks':url_mask_array
        }

    return jsonify(response)
    
    
def insert_urlmask(urllist_id,Session):
    json_data = request.get_json()

    if not json_data or json_data.get('name') == None:
        return jsonify({'success':False,'message':'Bad JSON request'})

    session = Session()

    new_url_mask = UrlMask(urlListId=urllist_id,name=json_data.get('name'))

    try:
        session.add(new_url_mask)
        session.commit()

        response = {
            'success':True,
            'urlMasks':[{'id':new_url_mask.id}]
            }
    except Exception as e:
        response = {
            'success':False
            }

    session.close()

    return jsonify(response)


def delete_urlmask(urllist_id,urlmask_id,Session):
    session = Session()

    try:
        session.delete(session.query(UrlMask).filter_by(urlListId=urllist_id,id=urlmask_id).first())
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
