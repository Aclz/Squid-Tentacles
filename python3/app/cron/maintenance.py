#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
Archiving the accessLog table
Locking users for quota exceeding
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from config import config
from sql_classes import User


def _lock_users_for_quota_exceeding(session):
    # Get active users
    query_result = session.query(User).filter_by(hidden=0, status=1).all()

    for user in query_result:
        if user.traffic > (user.quota + user.extraQuota)*1024*1024:
            setattr(user, 'status', 2)

    session.commit()


def main():
    engine = create_engine(
        config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    session.execute(
        'call archiveAccessLog(:defaultDomainName)',
        params={'defaultDomainName': config['Authentication']['DefaultDomainName']})

    session.commit()

    _lock_users_for_quota_exceeding(session)

    session.close()

if __name__ == '__main__':
    main()
