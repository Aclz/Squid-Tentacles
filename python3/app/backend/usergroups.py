import datetime
from sqlalchemy import func, between
from sqlalchemy.orm import aliased
from calendar import mdays
from flask import request, jsonify

from sql_classes import User, UserGroup, AccessLogArchive


def report_select_group_members(current_user_properties, Session):
    mandatory_params = ['userGroupId']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({
                'success': False,
                'message': 'ABSENT_REQUEST_PARAMETER:' + param_name
                })

    current_user_permissions = current_user_properties['user_permissions']

    session = Session()
    
    date = datetime.date.today()
    start_date = datetime.datetime(date.year, date.month, 1)
    end_date = datetime.datetime(date.year, date.month, mdays[date.month])
    
    subquery = session.query(AccessLogArchive.userId, func.sum(AccessLogArchive.traffic).label('traffic')).filter(
        between(AccessLogArchive.date, start_date, end_date)).group_by(AccessLogArchive.userId).subquery()

    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) != None:
        if (request.args.get('userGroupId') == '0'):
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
                subquery.c.traffic.label('traffic')).filter(User.hidden == 0).\
                outerjoin(subquery, subquery.c.userId == User.id).order_by(User.cn).all()
        else:
            user_group = aliased(UserGroup)
            requested_group = aliased(UserGroup)

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
                subquery.c.traffic.label('traffic')).filter(User.hidden == 0).\
                outerjoin(subquery, subquery.c.userId == User.id).join(user_group).\
                join(requested_group, user_group.distinguishedName.like('%' + requested_group.distinguishedName)).\
                filter(requested_group.id == request.args.get('userGroupId')).order_by(User.cn).all()
    else:
        if (request.args.get('userGroupId') == '0'):
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
                subquery.c.traffic.label('traffic')).\
                outerjoin(subquery, subquery.c.userId == User.id).\
                filter_by(id=current_user_properties['user_object']['id'], hidden=0).\
                order_by(User.cn).all()
        else:
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
                subquery.c.traffic.label('traffic')).\
                outerjoin(subquery, subquery.c.userId == User.id).\
                filter_by(id=current_user_properties['user_object']['id'], hidden=0).\
                join(UserGroup).filter(UserGroup.id == request.args.get('userGroupId')).order_by(User.cn).all()

    Session.remove()

    result_list = []

    for result_row in query_result:
        row_object = {
            'username': result_row.cn,
            'status': result_row.status,
            'roleId': result_row.roleId,
            'authMethod': result_row.authMethod,
            'aclId': result_row.aclId,
            'quota': result_row.quota,
            'extraQuota': result_row.extraQuota,
            'traffic': float(round(result_row.traffic/1024/1024, 2)) if result_row.traffic is not None else float(0),
            }

        if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) == None:
            forbidden_items = ['authMethod', 'aclId', 'roleId']

            if result_row.id != current_user_properties['user_object']['id']:
                forbidden_items.extend(['status', 'quota', 'extraQuota', 'traffic'])

            for item in forbidden_items:
                if row_object.get(item) != None:
                    row_object.pop(item)

        if next((item for item in current_user_permissions if item['permissionName'] == 'ViewPermissions'), None) == None:
            forbidden_items = ['roleId']

            for item in forbidden_items:
                if row_object.get(item) != None:
                    row_object.pop(item)

        result_list.append(row_object)

    response = {
        'success': True,
        'data': result_list
        }

    return jsonify(response)
