from flask import request, jsonify

from sql_classes import Permission

def select_permissions(Session):
    session = Session()

    query_result = session.query(Permission).all()
    
    session.close()

    if query_result == None:
        return jsonify({
            'success': True,
            'data': []
            })

    permissions_list = []

    for query_result_row in query_result:
        permission_object = {
            'id': query_result_row.id,
            'name': query_result_row.name
            }

        permissions_list.append(permission_object)

    response = {
        'success': True,
        'data': permissions_list
        }

    return jsonify(response)
