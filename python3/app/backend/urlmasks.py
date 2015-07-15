from flask import request,jsonify

from sql_classes import UrlMask

def select_urlmasks(urllist_id,Session):
    session = Session()

    queryResult = session.query(UrlMask).filter_by(urlListId=urllist_id).all()

    session.close()

    if queryResult == None:
        return jsonify({
            'success':True,
            'urlMasks':[]
            })

    urlMaskArray = []

    #Making an array of them
    for queryResultRow in queryResult:
        url_list_mask_object = {
            'id':queryResultRow.id,
            'name':queryResultRow.name
            }

        urlMaskArray.append(url_list_mask_object)

    response = {
        'success':True,
        'urlMasks':urlMaskArray
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
