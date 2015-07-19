#!/usr/local/bin/tentacles/python3/bin/python -tt

import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker

from sql_classes import User
from config import config

def check_ip_mysql(ipaddr):
    session = Session()
    queryResult = session.query(User).filter_by(ip=ipaddr,status=1,hidden=0,authMethod=1).first()
    session.close()

    if queryResult != None:
        return 'OK'

    return 'ERR'


engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
    pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

Session = scoped_session(sessionmaker(bind=engine))

while True:
    ipaddr = sys.stdin.readline().strip()
    result = check_ip_mysql(ipaddr)
    sys.stdout.write(result + '\n')
    sys.stdout.flush()