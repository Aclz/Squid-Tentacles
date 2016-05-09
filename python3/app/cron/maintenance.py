#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
Archiving the accessLog table
Locking users for quota exceeding
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session,sessionmaker

from config import config

def main():
    engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()
    
    session.execute('call maintenance(:defaultDomainName)',
        params={'defaultDomainName': config['Authentication']['DefaultDomainName']})
        
    session.commit()
    session.close()

if __name__ == '__main__':
    main()
