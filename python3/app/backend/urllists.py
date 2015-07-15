from flask import request,jsonify

from sql_classes import UrlList

def select_urllists(Session):
    session = Session()

    queryResult = session.query(UrlList).all()

    session.close()

    if queryResult == None:
        return jsonify({
            'success':True,
            'urlLists':[]
            })

    urlListsArray = []

    #Making an array of them
    for queryResultRow in queryResult:
        url_list_object = {
            'id':queryResultRow.id,
            'name':queryResultRow.name
            }

        urlListsArray.append(url_list_object)

    response = {
        'success':True,
        'urlLists':urlListsArray
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
