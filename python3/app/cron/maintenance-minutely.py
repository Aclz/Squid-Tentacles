#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
Archive accessLog table
Lock users for quota exceeding
"""
import datetime

import sqlalchemy
from sqlalchemy import create_engine, insert, update, case, between, func, and_, or_
from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text, CHAR
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.operators import is_, isnot
from calendar import mdays

from config import config
from sql_classes import AccessLog, AccessLogArchive, User


def _archive_access_log(engine, session, default_domain_name):
    try:
        Temp = declarative_base()

        class AccessLogToArchive(Temp):
            __tablename__ = 'accessLogToArchive'
            __table_args__ = {'prefixes': ['TEMPORARY']}
            id = Column(Integer, primary_key=True)
            time_since_epoch = Column(Numeric(15, 3))
            ip_client = Column(CHAR(15))
            http_status_code = Column(String(10))
            http_reply_size = Column(Integer)
            http_url = Column(Text)
            http_username = Column(String(100))
            userId = Column(Integer)
            archived = Column(Boolean)

        Temp.metadata.create_all(bind=engine)

        # Fill temporary table with unarchived chunk of data
        access_log_subquery = session.query(
            AccessLog.id,
            AccessLog.time_since_epoch,
            AccessLog.ip_client,
            AccessLog.http_status_code,
            AccessLog.http_reply_size,
            AccessLog.http_url,
            case([(
                sqlalchemy.or_(
                    AccessLog.http_username.contains('@'),
                    AccessLog.http_username.contains('\\'),
                    AccessLog.http_username == '-'),
                AccessLog.http_username)],
                else_=AccessLog.http_username + '@' + default_domain_name).label('http_username'),
            AccessLog.archived).filter(is_(AccessLog.archived, None)).limit(1000000)  # limit to prevent overload on a huge amount of data

        ins = insert(AccessLogToArchive).from_select([
            'id', 'time_since_epoch', 'ip_client', 'http_status_code', 'http_reply_size',
            'http_url', 'http_username', 'archived'], access_log_subquery)

        session.execute(ins)

        query_result = session.query(AccessLogToArchive.http_username, User.cn).filter(
            and_(User.authMethod == 0, User.userPrincipalName == AccessLogToArchive.http_username)).all()

        # Set user ID field
        session.query(AccessLogToArchive).filter(
            or_(
                and_(User.authMethod == 0, User.userPrincipalName == AccessLogToArchive.http_username),
                and_(User.authMethod == 1, User.ip == AccessLogToArchive.ip_client))).update(
            {AccessLogToArchive.userId: User.id}, synchronize_session=False)

        session.query(AccessLog).filter(AccessLog.id == AccessLogToArchive.id).update(
            {AccessLog.userId: AccessLogToArchive.userId}, synchronize_session=False)

        # Get host from URL: strip protocol
        session.query(AccessLogToArchive).filter(func.locate('://', AccessLogToArchive.http_url) > 0).update(
            {AccessLogToArchive.http_url:
                func.substring(AccessLogToArchive.http_url, func.locate('://', AccessLogToArchive.http_url) + 3)},
            synchronize_session=False)

        # Get host from URL: strip port and the rest
        session.query(AccessLogToArchive).filter(func.locate(':', AccessLogToArchive.http_url) > 0).update(
            {AccessLogToArchive.http_url:
                func.left(AccessLogToArchive.http_url, func.locate(':', AccessLogToArchive.http_url) - 1)},
            synchronize_session=False)

        # Get host from URL: strip everything after the first slash
        session.query(AccessLogToArchive).filter(func.locate('/', AccessLogToArchive.http_url) > 0).update(
            {AccessLogToArchive.http_url:
                func.left(AccessLogToArchive.http_url, func.locate('/', AccessLogToArchive.http_url) - 1)},
            synchronize_session=False)

        # Make summary traffic table
        subquery = session.query(
            func.date(func.from_unixtime(AccessLogToArchive.time_since_epoch)).label('date'),
            AccessLogToArchive.userId,
            AccessLogToArchive.http_url.label('host'),
            func.sum(AccessLogToArchive.http_reply_size).label('traffic')).\
            filter(AccessLogToArchive.http_status_code.like('2%')).\
            group_by(
                func.date(func.from_unixtime(AccessLogToArchive.time_since_epoch)),
                AccessLogToArchive.userId,
                AccessLogToArchive.http_url).\
            having(func.sum(AccessLogToArchive.http_reply_size) > 0).subquery()

        # Update existing rows
        session.query(AccessLogArchive).filter(
            AccessLogArchive.date == subquery.c.date,
            AccessLogArchive.userId == subquery.c.userId,
            AccessLogArchive.host == subquery.c.host).\
            update({AccessLogArchive.traffic: AccessLogArchive.traffic + subquery.c.traffic}, synchronize_session=False)

        # Insert new rows
        access_log_subquery = session.query(subquery).outerjoin(
            AccessLogArchive, and_(
                AccessLogArchive.date == subquery.c.date,
                AccessLogArchive.userId == subquery.c.userId,
                AccessLogArchive.host == subquery.c.host)).\
            filter(AccessLogArchive.id.is_(None), subquery.c.userId.isnot(None))

        ins = insert(AccessLogArchive).from_select(['date', 'userId', 'host', 'traffic'], access_log_subquery)

        session.execute(ins)

        # Mark access log chunk as archived
        session.query(AccessLog).filter(
            AccessLog.id == AccessLogToArchive.id).\
            update({AccessLog.archived: 1}, synchronize_session=False)

        session.commit()

        '''
        # Drop temp table
        AccessLogToArchive.__table__.drop(engine)
        '''
    except:
        session.rollback()
        raise


def _lock_users_for_quota_exceeding(session):
    # Get active users
    date = datetime.date.today()
    start_date = datetime.datetime(date.year, date.month, 1)
    end_date = datetime.datetime(date.year, date.month, mdays[date.month])
    
    subquery = session.query(AccessLogArchive.userId, func.sum(AccessLogArchive.traffic).label('traffic')).filter(
        between(AccessLogArchive.date, start_date, end_date)).group_by(AccessLogArchive.userId).subquery()
        
    query_result = session.query(User).filter(
        User.hidden == 0,
        User.status == 1,
        subquery.c.userId == User.id,
        subquery.c.traffic > (User.quota + User.extraQuota)*1024*1024).all()

    for user in query_result:
        setattr(user, 'status', 2)

    session.commit()


def main():
    engine = create_engine(
        config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    _archive_access_log(engine, session, config['Authentication']['DefaultDomainName'])
    _lock_users_for_quota_exceeding(session)

    Session.remove()


if __name__ == '__main__':
    main()
