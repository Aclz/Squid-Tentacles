import datetime
import eventlog
from flask import request, jsonify
from sqlalchemy import func, between
from calendar import mdays

from sql_classes import User, AccessLogArchive


def select_user(current_user_properties, requested_user_id, Session):
    session = Session()
    
    date = datetime.date.today()
    start_date = datetime.datetime(date.year, date.month, 1)
    end_date = datetime.datetime(date.year, date.month, mdays[date.month])
    
    subquery = session.query(AccessLogArchive.userId, func.sum(AccessLogArchive.traffic).label('traffic')).filter(
        between(AccessLogArchive.date, start_date, end_date),
        AccessLogArchive.userId == requested_user_id).group_by(AccessLogArchive.userId).subquery()

    query_result = session.query(
        User.id.label('id'),
        User.cn.label('cn'),
        User.userPrincipalName.label('userPrincipalName'),
        User.status.label('status'),
        User.quota.label('quota'),
        User.extraQuota.label('extraQuota'),
        User.authMethod.label('authMethod'),
        User.ip.label('ip'),
        User.aclId.label('aclId'),
        User.roleId.label('roleId'),
        subquery.c.traffic.label('traffic')).filter(User.id == requested_user_id, User.hidden == 0).\
        outerjoin(subquery, subquery.c.userId == User.id).first()

    session.close()

    if query_result is None:
        return jsonify(success=False)

    requested_user_object = {
        'id': query_result.id,
        'cn': query_result.cn,
        'userPrincipalName': query_result.userPrincipalName,
        'status': query_result.status,
        'quota': query_result.quota,
        'extraQuota': query_result.extraQuota,
        'authMethod': query_result.authMethod,
        'ip': query_result.ip if query_result.ip is not None else '0.0.0.0',
        'traffic': float(round(query_result.traffic/1024/1024, 2)) if query_result.traffic is not None else float(0),
        'aclId': query_result.aclId,
        'roleId': query_result.roleId
        }

    current_user_permissions = current_user_properties['user_permissions']

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) == None:
        forbidden_items = ['authMethod', 'ip', 'aclId', 'roleId']

        if requested_user_id != current_user_properties['user_object']['id']:
            forbidden_items.extend(['status', 'quota', 'extraQuota', 'traffic'])

        for item in forbidden_items:
            if requested_user_object.get(item) != None:
                requested_user_object.pop(item)

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) == None:
        forbidden_items = ['roleId']

        for item in forbidden_items:
            if requested_user_object.get(item) != None:
                requested_user_object.pop(item)

    response = {
        'success': True,
        'data': requested_user_object
        }

    return jsonify(response)


def update_user(user_id, Session):
    json_data = request.get_json()

    if not json_data:
        return jsonify({
            'success': False,
            'message': 'BAD_JSON_REQUEST'
            })

    session = Session()

    # Check IP uniqueness
    ip_to_set = json_data.get('ip')

    if ip_to_set is not None and ip_to_set != '0.0.0.0':
        query_result = session.query(User).filter(User.ip == ip_to_set, User.id != user_id).first()

        if query_result is not None:
            return jsonify({
                'success': False,
                'message': 'IP_NOT_UNIQUE:' + query_result.cn + ' (' + query_result.userPrincipalName + ')'
                })

    # Update user attributes
    query_result = session.query(User).get(user_id)

    if query_result is None:
        return jsonify(success=False)

    do_commit = False

    allowed_to_update_fields = ['status', 'quota', 'extraQuota', 'authMethod', 'ip', 'aclId', 'roleId']

    for field_name in allowed_to_update_fields:
        if json_data.get(field_name) != None:
            if field_name == 'ip' and json_data.get(field_name) == '0.0.0.0':
                continue

            setattr(query_result, field_name, json_data.get(field_name))
            do_commit = True

    try:
        if do_commit:
            session.commit()

        response = {
            'success': True
            }
    except Exception as e:
        response = {
            'success': False
            }
    finally:
        session.close()

    return jsonify(response)
