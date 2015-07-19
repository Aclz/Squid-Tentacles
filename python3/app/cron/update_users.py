#!/usr/local/bin/tentacles/python3/bin/python -tt

"""
DB users table update with those got from LDAP-server
Opening new traffic period: counters reset, unblocking users who have exceeded quota in previous period
"""

from sqlalchemy import Column, Integer, String, SmallInteger, Boolean, BigInteger, Numeric, Date, Text
from sqlalchemy import create_engine
from sqlalchemy.schema import ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session,sessionmaker

from config import config

def main():
    from get_ldap_users import get_ldap_users

    KeytabFilePath = config['Authentication']['KeytabFilePath']
    LdapUrl = config['LDAP']['Url']
    BaseDn = config['LDAP']['BaseDn']
    LdapQuery = config['LDAP']['Query']

    LdapUsers = get_ldap_users(KeytabFilePath,LdapUrl,BaseDn,LdapQuery)

    Temp = declarative_base()

    class TempUser(Temp):
        __tablename__ = 'tempUsers'
        __table_args__ = {'prefixes': ['TEMPORARY']}
        id = Column(Integer,primary_key=True)
        distinguishedName = Column(String(250),nullable = False)
        cn = Column(String(250), nullable = False)
        userPrincipalName = Column(String(250),nullable = False,unique = True)

    engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    Temp.metadata.create_all(bind=engine)

    for LdapUser in LdapUsers:
        temp_user = TempUser(distinguishedName=LdapUser[0],cn=LdapUser[1],userPrincipalName=LdapUser[2])

        session.add(temp_user)

    session.commit()

    session.execute("CALL updateUsers();")
    session.commit()

    session.execute("CALL openNewTrafficPeriod();")
    session.commit()

    session.close()

if __name__ == '__main__':
    main()