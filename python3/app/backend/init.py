from flask import jsonify

from authorization import get_role_object, get_role_permissions


def who_am_i(user_object, session):
    if user_object is None:
        return jsonify({
            'success': True,
            'data': {
                'id': 0,
                'status': 0,
                'cn': 'Анонимный пользователь'
                }
            })

    return jsonify({
        'success': True,
        'data': {
            'id': user_object['id'],
            'status': 1,
            'cn': user_object['cn']
            }
        })


def my_permissions(user_permissions, session):
    if user_permissions is None:
        return jsonify({
            'success': True,
            'data': []
            })

    return jsonify({
        'success': True,
        'data': user_permissions
        })
