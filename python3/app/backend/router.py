#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
RESTful Flask backend for Ext JS frontend
"""
from os import environ

from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from authentication import init_kerberos, authorization

from config import config
import maintree, urllists, urlmasks, acls, aclcontents
import users, usergroups, permissions, roles, rolepermissions, accesslogreports, settings
import init

app = Flask(__name__)

#for debugging purposes only!
app.config['PROPAGATE_EXCEPTIONS'] = True

#check kerberos auth rediness
environ['KRB5_KTNAME'] = config['Authentication']['KeytabFilePath']
init_kerberos(app, hostname=config['Authentication']['ServerPrincipalName'])

#init ORM
engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))


#Identity requests
@app.route('/rest/whoami', methods=['GET'])
@authorization(['Allow'], Session, True)
def who_am_i(user_properties):
    return init.who_am_i(user_properties['user_object'], Session)
    

@app.route('/rest/mypermissions', methods=['GET'])
@authorization(['Allow'], Session, True)
def my_permissions(user_properties):
    return init.my_permissions(user_properties['user_permissions'], Session)


#URL lists
@app.route('/rest/urllists', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_urllists():
    return urllists.select_urllists(Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_urllist(urllist_id):
    return urllists.select_urllist(urllist_id, Session)
        

@app.route('/rest/urllists', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_urllist():
    return urllists.insert_urllist(Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_urllist(urllist_id):
    return urllists.update_urllist(urllist_id, Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_urllist(urllist_id):
    return urllists.delete_urllist(urllist_id, Session)
    

@app.route('/rest/urllists/<int:urllist_id>/urlmasks', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_urlmasks(urllist_id):
    return urlmasks.select_urlmasks(urllist_id, Session)


@app.route('/rest/urllists/<int:urllist_id>/urlmasks', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_urlmask(urllist_id):
    return urlmasks.insert_urlmask(urllist_id, Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>/urlmasks/<int:urlmask_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_urlmask(urllist_id, urlmask_id):
    return urlmasks.update_urlmask(urllist_id, urlmask_id, Session)


@app.route('/rest/urllists/<int:urllist_id>/urlmasks/<int:urlmask_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_urlmask(urllist_id, urlmask_id):
    return urlmasks.delete_urlmask(urllist_id, urlmask_id, Session)
    

#Access control lists
@app.route('/rest/acls', methods=['GET'])
@authorization(['ViewSettings', 'ViewUsers'], Session)
def select_acls():
    return acls.select_acls(Session)
    
    
@app.route('/rest/acls/<int:acl_id>', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_acl(acl_id):
    return acls.select_acl(acl_id, Session)
    
    
@app.route('/rest/acls', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_acl():
    return acls.insert_acl(Session)
    
    
@app.route('/rest/acls/<int:acl_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_acl(acl_id):
    return acls.update_acl(acl_id, Session)


@app.route('/rest/acls/<int:acl_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_acl(acl_id):
    return acls.delete_acl(acl_id, Session)
    
    
@app.route('/rest/acls/<int:acl_id>/contents', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_acl_contents(acl_id):
    return aclcontents.select_acl_contents(acl_id, Session)


@app.route('/rest/acls/<int:acl_id>/contents', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_acl_contents(acl_id):
    return aclcontents.insert_acl_contents(acl_id, Session)
    
    
@app.route('/rest/acls/<int:acl_id>/contents/<int:aclcontent_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_acl_contents(acl_id, acl_content_id):
    return aclcontents.update_acl_contents(acl_id, acl_content_id, Session)


@app.route('/rest/acls/<int:acl_id>/contents/<int:aclcontent_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_acl_contents(acl_id, aclcontent_id):
    return aclcontents.delete_acl_contents(acl_id, aclcontent_id, Session)


#Roles
@app.route('/rest/permissions', methods=['GET'])
@authorization(['ViewPermissions'], Session)
def select_permissions():
    return permissions.select_permissions(Session)


@app.route('/rest/roles', methods=['GET'])
@authorization(['ViewPermissions'], Session)
def select_roles():
    return roles.select_roles(Session)


@app.route('/rest/roles/<int:role_id>', methods=['GET'])
@authorization(['ViewPermissions'], Session)
def select_role(role_id):
    return roles.select_role(role_id, Session)


@app.route('/rest/roles', methods=['POST'])
@authorization(['EditPermissions'], Session)
def insert_role():
    return roles.insert_role(Session)


@app.route('/rest/roles/<int:role_id>', methods=['PUT'])
@authorization(['EditPermissions'], Session)
def update_role(role_id):
    return roles.update_role(role_id, Session)


@app.route('/rest/roles/<int:role_id>', methods=['DELETE'])
@authorization(['EditPermissions'], Session)
def delete_role(role_id):
    return roles.delete_role(role_id, Session)
    
    
@app.route('/rest/roles/<int:role_id>/permissions', methods=['GET'])
@authorization(['ViewPermissions'], Session)
def select_role_permissions(role_id):
    return rolepermissions.select_role_permissions(role_id, Session)
    

@app.route('/rest/roles/<int:role_id>/permissions', methods=['POST'])
@authorization(['EditPermissions'], Session)
def insert_role_permission(role_id):
    return rolepermissions.insert_role_permissions(role_id, Session)
    
    
@app.route('/rest/roles/<int:role_id>/permissions/<int:permission_id>', methods=['DELETE'])
@authorization(['EditPermissions'], Session)
def delete_role_permission(role_id, permission_id):
    return rolepermissions.delete_role_permission(role_id, permission_id, Session)


#Users
@app.route('/rest/users/<int:user_id>', methods=['GET'])
@authorization(['Allow'], Session, True)
def select_user(user_properties, user_id):
    return users.select_user(user_properties, user_id, Session)


@app.route('/rest/users/<int:user_id>', methods=['PUT'])
@authorization(['_EditUsers'], Session)
def update_user(user_id):
    return users.update_user(user_id, Session)
    

#Main tree
@app.route('/rest/tree/<node_name>', methods=['GET'])
@authorization(['Allow'], Session, True)
def select_tree(user_properties, node_name):
    return maintree.select_tree(user_properties, node_name, Session)


#User reports
@app.route('/rest/reports/user-traffic-by-hosts', methods=['GET'])
@authorization(['_ViewUserTrafficReports'], Session)
def report_user_traffic_by_hosts():
    return accesslogreports.report_user_traffic_by_hosts(Session)


@app.route('/rest/reports/user-traffic-by-dates', methods=['GET'])
@authorization(['_ViewUserTrafficReports'], Session)
def report_user_traffic_by_dates():
    return accesslogreports.report_user_traffic_by_dates(Session)


@app.route('/rest/reports/user-day-traffic', methods=['GET'])
@authorization(['_ViewUserTrafficReports'], Session)
def report_user_day_traffic():
    return accesslogreports.report_user_day_traffic(Session)
    
    
#Group reports
@app.route('/rest/reports/group-members', methods=['GET'])
@authorization(['Allow'], Session, True)
def report_select_group_members(user_properties):
    return usergroups.report_select_group_members(user_properties, Session)
    

@app.route('/rest/reports/group-traffic-by-hosts', methods=['GET'])
@authorization(['ViewUsers'], Session)
def report_group_traffic_by_hosts():
    return accesslogreports.report_group_traffic_by_hosts(Session)
    
    
@app.route('/rest/reports/group-traffic-by-dates', methods=['GET'])
@authorization(['ViewUsers'], Session)
def report_group_traffic_by_dates():
    return accesslogreports.report_group_traffic_by_dates(Session)


@app.route('/rest/reports/group-day-traffic', methods=['GET'])
@authorization(['ViewUsers'], Session)
def report_group_day_traffic():
    return accesslogreports.report_group_day_traffic(Session)
    
    
@app.route('/rest/reports/group-traffic-by-users', methods=['GET'])
@authorization(['ViewUsers'], Session)
def report_group_traffic_by_users():
    return accesslogreports.report_group_traffic_by_users(Session)
    

#Settings requests
@app.route('/rest/settings', methods=['GET'])
@authorization(['ViewSettings', 'ViewPermissions'], Session, True)
def select_settings(user_properties):
    return settings.select_settings(user_properties, Session)
    
    
@app.route('/rest/settings', methods=['PUT'])
@authorization(['_EditSettings'], Session)
def update_settings():
    return settings.update_settings(Session)


if __name__ == '__main__':
    app.run(debug=True, host=config['Network']['WebInterfaceIpAddress'], port=8080)