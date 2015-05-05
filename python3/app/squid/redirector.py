#!/usr/local/bin/tentacles/python3/bin/python -tt

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker

from config import config
from sql_classes import User


def user_status_ok(givenUsername,givenIp):
    session = Session()
    queryResult = session.query(User).filter_by(userPrincipalName=givenUsername,status=1,hidden=0,authMethod=0).first()
    session.close()

    if queryResult != None:
        return True

    session = Session()
    queryResult = session.query(User).filter_by(ip=givenIp,status=1,hidden=0,authMethod=1).first()
    session.close()

    if queryResult != None:
        return True

    return False


def modify_url(line):
    list = line.split(' ')

    #Decode string
    url = list[0]
    ip = list[1].split('/')[0]
    username = list[2]

    new_url = '\n'

    if not user_status_ok(username,ip):
        new_url = 'http://' + WebInterfaceIpAddress + '/redir/banned.html' + new_url
    
    return new_url


engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))

while True:
    line = sys.stdin.readline().strip()
    new_url = modify_url(line)
    sys.stdout.write(new_url)
    sys.stdout.flush()