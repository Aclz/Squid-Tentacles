from flask import request

from sql_classes import User, Role, Permission, RolePermission
from config import config


def get_user_object(user_id, Session):
    session = Session()

    query_result = session.query(User).filter_by(id = user_id, hidden = 0).first()

    session.close()

    if query_result is None:
        return None

    user_object = {
        'id': query_result.id,
        'cn': query_result.cn,
        'userPrincipalName': query_result.userPrincipalName,
        'status': query_result.status,
        'quota': query_result.quota,
        'authMethod': query_result.authMethod,
        'ip': query_result.ip,
        'traffic': round(query_result.traffic/1024/1024, 2),
        'aclId': query_result.aclId,
        'roleId': query_result.roleId
        }

    return user_object
    
    
def get_role_object(role_id, Session):
    session = Session()

    query_result = session.query(Role).filter_by(id = role_id).first()

    session.close()

    if query_result is None:
        return None

    role_object = {
        'id': query_result.id,
        'name': query_result.name
        }

    return role_object
    
    
def check_role_permission(role_id, permission, Session):
    if type(permission) is str: #a check against a single permission
        if permission == 'Allow':
            return True
        elif permission == 'Deny':
            return False
        
        session = Session()

        query_result = session.query(RolePermission).filter_by(roleId=role_id).\
            join(Permission).filter(Permission.name==permission).first()

        session.close()

        return False if query_result is None else True
    elif type(permission) is list: #here a list means that each of a list permissions is required
        for permission_item in permission:
            if permission_item == 'Deny':
                return False
            elif permission_item == 'Allow':
                pass
            else:
                session = Session()

                query_result = session.query(RolePermission).filter_by(roleId=role_id).\
                    join(Permission).filter(Permission.name==permission_item).first()

                session.close()    
            
                if query_result is None:
                    return False
                    
            return True
    else: #unexpected
        return False
    

def get_role_permissions(role_id, Session):
    session = Session()

    if config['Authentication']['Enabled'] != 'False' and config['Authorization']['Enabled'] != 'False':
        query_result = session.query(Permission).join(RolePermission).filter(RolePermission.roleId==role_id).all()
    else:
        #all permission in case when authentication or authorization is disabled
        query_result = session.query(Permission).all()

    session.close()

    if query_result is None:
        return []

    permissions_list = []

    for query_result_row in query_result:
        permissions_list.append({
            'permissionId': query_result_row.id,
            'permissionName': query_result_row.name
            })

    return permissions_list
    
    
'''
Requires both EditPermissions and EditUsers permissions if user role change was requested.
Requires EditUsers permission overwise.
'''
def edit_user_permission():
    json_data = request.get_json()
    
    if json_data.get('roleId') != None:
        return ['EditPermissions', 'EditUsers']
    else:
        return 'EditUsers'
        
        
'''
Requires both EditPermissions and EditSettings permissions if default role change was requested.
Requires EditSettings permission overwise.
'''
def edit_settings_permission():
    json_data = request.get_json()

    if json_data.get('defaultRoleId') != None:
        return ['EditPermissions', 'EditSettings']
    else:
        return 'EditSettings'


'''
Requires ViewUsers permission for foreign user requests.
'''
def view_user_traffic_reports_permission(user_id):
    requested_user_id = request.args.get('userId')

    if requested_user_id != str(user_id):
        return 'ViewUsers'
    else:
        return 'Allow'
        
    
'''
Replaces given permission name by real permission (one from the permissions table)
needed to complete requested operation (by analyzing request contents).
'''
def real_permissions_needed(user_id, permission):
    if not type(permission) is str:
        return 'Deny'
        
    if permission == '_EditUsers':
        return edit_user_permission()
    elif permission == '_EditSettings':
        return edit_settings_permission()
    elif permission == '_ViewUserTrafficReports':
        return view_user_traffic_reports_permission(user_id)
    else:
        return permission


'''
permission_list is a list of permissions, any of which is sufficient in order to
get a successive result (OR-rule). Besides a string, an item also can be a list by itself -
in this case all of the privileges contained in such an inner list are required to get a
successive result (AND-rule).
'''
def check_permissions(user_id, permission_list, session):
    if config['Authentication']['Enabled'] == 'False':
        return True
    
    if config['Authorization']['Enabled'] == 'False':
        return True
        
    if not type(permission_list) is list:
        return False
        
    real_permissions_list = []
        
    for permission in permission_list:
        real_permissions_list.append(real_permissions_needed(user_id, permission))  
        
    role_id = get_user_object(user_id, session)['roleId']

    if role_id is None:
        return False
    
    for permission in real_permissions_list:
        if check_role_permission(role_id, permission, session):
            return True
        
    return False
