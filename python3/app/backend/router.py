#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
RESTful Flask backend for Ext JS frontend
"""

import sys

from flask import Flask

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker

from config import config

import maintree,urllists,urlmasks,accesstemplates,accesstemplatecontents,users,accesslogreports,settings


app = Flask(__name__)

engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))


@app.route('/rest/urllists',methods=['GET'])
def select_urllists():
    return urllists.select_urllists(Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>',methods=['GET'])
def select_urllist(urllist_id):
    return urllists.select_urllist(urllist_id,Session)
        

@app.route('/rest/urllists',methods=['POST'])
def insert_urllist():
    return urllists.insert_urllist(Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>',methods=['PUT'])
def update_urllist(urllist_id):
    return urllists.update_urllist(urllist_id,Session)
    
    
@app.route('/rest/urllists/<int:urllist_id>',methods=['DELETE'])
def delete_urllist(urllist_id):
    return urllists.delete_urllist(urllist_id,Session)
    

@app.route('/rest/urllists/<int:urllist_id>/urlmasks',methods=['GET'])
def select_urlmasks(urllist_id):
    return urlmasks.select_urlmasks(urllist_id,Session)


@app.route('/rest/urllists/<int:urllist_id>/urlmasks',methods=['POST'])
def insert_urlmask(urllist_id):
    return urlmasks.insert_urlmask(urllist_id,Session)


@app.route('/rest/urllists/<int:urllist_id>/urlmasks/<int:urlmask_id>',methods=['DELETE'])
def delete_urlmask(urllist_id,urlmask_id):
    return urlmasks.delete_urlmask(urllist_id,urlmask_id,Session)
    
    
@app.route('/rest/accesstemplates',methods=['GET'])
def select_accesstemplates():
    return accesstemplates.select_accesstemplates(Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>',methods=['GET'])
def select_accesstemplate(accesstemplate_id):
    return accesstemplates.select_accesstemplate(accesstemplate_id,Session)
    
    
@app.route('/rest/accesstemplates',methods=['POST'])
def insert_accesstemplate():
    return accesstemplates.insert_accesstemplate(Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>',methods=['PUT'])
def update_accesstemplate(accesstemplate_id):
    return accesstemplates.update_accesstemplate(accesstemplate_id,Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>',methods=['DELETE'])
def delete_accesstemplate(accesstemplate_id):
    return accesstemplates.delete_accesstemplate(accesstemplate_id,Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents',methods=['GET'])
def select_accesstemplatecontents(accesstemplate_id):
    return accesstemplatecontents.select_accesstemplatecontents(accesstemplate_id,Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents',methods=['POST'])
def insert_accesstemplatecontents(accesstemplate_id):
    return accesstemplatecontents.insert_accesstemplatecontents(accesstemplate_id,Session)
    
    
@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents/<int:accesstemplatecontent_id>',methods=['PUT'])
def update_accesstemplatecontents(accesstemplate_id,accesstemplatecontent_id):
    return accesstemplatecontents.update_accesstemplatecontents(accesstemplate_id,accesstemplatecontent_id,Session)


@app.route('/rest/accesstemplates/<int:accesstemplate_id>/contents/<int:accesstemplatecontent_id>',methods=['DELETE'])
def delete_accesstemplatecontents(accesstemplate_id,accesstemplatecontent_id):
    return accesstemplatecontents.delete_accesstemplatecontents(accesstemplate_id,accesstemplatecontent_id,Session)


@app.route('/rest/users/<int:user_id>',methods=['GET'])
def select_user(user_id):
    return users.select_user(user_id,Session)


@app.route('/rest/users/<int:user_id>',methods=['PUT'])
def update_user(user_id):
    return users.update_user(user_id,Session)


@app.route('/rest/tree/<node_name>',methods=['GET'])
def select_tree(node_name):
    return maintree.select_tree(node_name,Session)


@app.route('/rest/reports/user-traffic-by-hosts',methods=['GET'])
def report_user_traffic_by_hosts():
    return accesslogreports.report_user_traffic_by_hosts(Session)


@app.route('/rest/reports/user-traffic-by-dates',methods=['GET'])
def report_user_traffic_by_dates():
    return accesslogreports.report_user_traffic_by_dates(Session)


@app.route('/rest/reports/user-day-traffic',methods=['GET'])
def report_user_day_traffic():
    return accesslogreports.report_user_day_traffic(Session)
    

@app.route('/rest/settings',methods=['GET'])
def select_settings():
    return settings.select_settings(Session)
    
    
@app.route('/rest/settings',methods=['PUT'])
def update_settings():
    return settings.update_settings(Session)



if __name__ == '__main__':
    app.run(debug = True,host=config['Network']['WebInterfaceIpAddress'],port=8080)