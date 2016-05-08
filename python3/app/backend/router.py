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
import maintree, urllists, urlmasks, accesstemplates, accesstemplatecontents
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


@app.route('/rest/whoami', methods=['GET'])
@authorization(['Allow'], Session, True)
def who_am_i(user_properties):
    return init.who_am_i(user_properties['user_object'], Session)
    

@app.route('/rest/mypermissions', methods=['GET'])
@authorization(['Allow'], Session, True)
def my_permissions(user_properties):
    return init.my_permissions(user_properties['user_permissions'], Session)


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


@app.route('/rest/urllists/<int:urllist_id>/urlmasks/<int:urlmask_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_urlmask(urllist_id, urlmask_id):
    return urlmasks.delete_urlmask(urllist_id, urlmask_id, Session)
    
    
@app.route('/rest/accesstemplates', methods=['GET'])
@authorization(['ViewSettings', 'ViewUsers'], Session)
def select_accesstemplates():
    return accesstemplates.select_accesstemplates(Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_accesstemplate(accesstemplate_id):
    return accesstemplates.select_accesstemplate(accesstemplate_id, Session)
    
    
@app.route('/rest/accesstemplates', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_accesstemplate():
    return accesstemplates.insert_accesstemplate(Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_accesstemplate(accesstemplate_id):
    return accesstemplates.update_accesstemplate(accesstemplate_id, Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_accesstemplate(accesstemplate_id):
    return accesstemplates.delete_accesstemplate(accesstemplate_id, Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents', methods=['GET'])
@authorization(['ViewSettings'], Session)
def select_accesstemplatecontents(accesstemplate_id):
    return accesstemplatecontents.select_accesstemplatecontents(accesstemplate_id, Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents', methods=['POST'])
@authorization(['EditSettings'], Session)
def insert_accesstemplatecontents(accesstemplate_id):
    return accesstemplatecontents.insert_accesstemplatecontents(accesstemplate_id, Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents/<int:accesstemplatecontent_id>', methods=['PUT'])
@authorization(['EditSettings'], Session)
def update_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id):
    return accesstemplatecontents.update_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id, Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents/<int:accesstemplatecontent_id>', methods=['DELETE'])
@authorization(['EditSettings'], Session)
def delete_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id):
    return accesstemplatecontents.delete_accesstemplatecontents(accesstemplate_id, accesstemplatecontent_id, Session)


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


@app.route('/rest/users/<int:user_id>', methods=['GET'])
@authorization(['Allow'], Session, True)
def select_user(user_properties, user_id):
    return users.select_user(user_properties, user_id, Session)


@app.route('/rest/users/<int:user_id>', methods=['PUT'])
@authorization(['_EditUsers'], Session)
def update_user(user_id):
    return users.update_user(user_id, Session)
    

@app.route('/rest/tree/<node_name>', methods=['GET'])
@authorization(['Allow'], Session, True)
def select_tree(user_properties, node_name):
    return maintree.select_tree(user_properties, node_name, Session)


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
    
    
@app.route('/rest/reports/group-users', methods=['GET'])
@authorization(['Allow'], Session, True)
def report_select_group_users(user_properties):
    return usergroups.report_select_group_users(user_properties, Session)
    

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