#!/usr/local/bin/tentacles/python3/bin/python -tt
"""
Autoclean accessLog table
"""
import datetime

import sqlalchemy
from sqlalchemy import create_engine, delete #, insert, update, case, between, func, and_, or_
#from sqlalchemy import Column, Integer, String, Boolean, Numeric, Text, CHAR
from sqlalchemy.orm import scoped_session, sessionmaker
#from sqlalchemy.ext.declarative import declarative_base
#from sqlalchemy.sql.operators import is_, isnot
#from calendar import mdays
from datetime import date
from time import mktime

from config import config
from sql_classes import AccessLog


def _clean_access_log(engine, session, clean_interval):
    if clean_interval <= 0:
        return

    today = date.today()

    try:
        border_date = date(today.year - (clean_interval + 12 - today.month)//12,
            today.month - clean_interval%12 if today.month > clean_interval%12 else 12 + today.month - clean_interval%12, 1)

        border_timestamp = mktime(border_date.timetuple())

        session.query(AccessLog).filter(AccessLog.time_since_epoch < border_timestamp).delete()
        session.commit()
    except:
        session.rollback()
        raise


def main():
    engine = create_engine(
        config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    _clean_access_log(engine, session, int(config['Logging']['KeepAccessLogInterval']))

    Session.remove()


if __name__ == '__main__':
    main()