from flask import request, jsonify
from sqlalchemy.orm import aliased

from sql_classes import User, UserGroup


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
    
    if next((item for item in current_user_permissions if item['permissionName'] == 'ViewUsers'), None) != None:
        if (request.args.get('userGroupId') == '0'):
            query_result = session.query(User).filter_by(hidden=0).order_by(User.cn).all()
        else:
            user_group = aliased(UserGroup)
            requested_group = aliased(UserGroup)
            
            query_result = session.query(User).filter_by(hidden=0).\
                join(user_group).join(requested_group, user_group.distinguishedName.like('%' + requested_group.distinguishedName)).\
                filter(requested_group.id==request.args.get('userGroupId')).order_by(User.cn).all()
    else:
        if (request.args.get('userGroupId') == '0'):
            query_result = session.query(User).filter_by(id=current_user_properties['user_object']['id'], hidden=0).\
                order_by(User.cn).all()
        else:
            query_result = session.query(User).filter_by(id=current_user_properties['user_object']['id'], hidden=0).\
                join(UserGroup).filter(UserGroup.id==request.args.get('userGroupId')).order_by(User.cn).all()
            
    session.close()
            
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
            'traffic': round(result_row.traffic/1024/1024, 2),
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