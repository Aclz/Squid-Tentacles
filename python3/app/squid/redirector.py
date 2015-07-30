#!/usr/local/bin/tentacles/python3/bin/python -tt

import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker
from sqlalchemy.sql.expression import literal

from config import config
from sql_classes import User,AccessTemplateContents,UrlList,UrlMask


def get_user_status(givenUsername,givenIp):
    session = Session()
    query_result = session.query(User).filter_by(userPrincipalName=givenUsername,status=1,hidden=0,authMethod=0).first()
    session.close()

    if query_result != None:
        return {
            'status_ok':True,
            'access_template':query_result.accessTemplate
            }

    session = Session()
    query_result = session.query(User).filter_by(ip=givenIp,status=1,hidden=0,authMethod=1).first()
    session.close()

    if query_result != None:
        return {
            'status_ok':True,
            'access_template':query_result.accessTemplate
            }

    return {
        'status_ok':False
        }
    
    
def url_ok(url,access_template):
    session = Session()
    
    query_result = session.query(UrlList.whitelist).\
        join(AccessTemplateContents,AccessTemplateContents.urlListId==UrlList.id).\
        join(UrlMask,UrlMask.urlListId==UrlList.id).\
        filter(AccessTemplateContents.accessTemplateId==access_template).\
        filter(literal(url).like('%' + UrlMask.name + '%')).\
        order_by(AccessTemplateContents.accessTemplateId,AccessTemplateContents.orderNumber).first()

    session.close()
    
    if query_result == None:
        return True
    
    for whitelist in query_result:
        return whitelist


def modify_url(line):
    list = line.split(' ')

    #Decode string
    url = list[0]
    ip = list[1].split('/')[0]
    username = list[2]

    user_status = get_user_status(username,ip)

    if not user_status['status_ok']:
        return 'http://' + config['Network']['WebInterfaceIpAddress'] + '/redir/banned.html\n'
        
    if not url_ok(url,user_status['access_template']):
        return 'http://' + config['Network']['WebInterfaceIpAddress'] + '/redir/forbidden.html\n'
    
    return '\n'


engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))

while True:
    line = sys.stdin.readline().strip()
    new_url = modify_url(line)
    sys.stdout.write(new_url)
    sys.stdout.flush()
