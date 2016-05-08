#!/usr/local/bin/tentacles/python3/bin/python -tt

"""
DB users table update with those got from LDAP-server
Opening new traffic period: counters reset, unblocking users who have exceeded quota in previous period
"""

from sqlalchemy import Column, Integer, String, SmallInteger, Boolean, BigInteger, Numeric, Date, Text
from sqlalchemy import create_engine
from sqlalchemy.schema import ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import scoped_session, sessionmaker

from config import config
from sql_classes import Settings


def main():
    from get_ldap_users import get_ldap_users

    keytab_file_path = config['Authentication']['KeytabFilePath']
    ldap_url = config['LDAP']['Url']
    base_dn = config['LDAP']['BaseDn']
    ldap_query = config['LDAP']['Query']

    ldap_users = get_ldap_users(keytab_file_path, ldap_url, base_dn, ldap_query)

    Temp = declarative_base()

    class TempUser(Temp):
        __tablename__ = 'tempUsers'
        __table_args__ = {'prefixes': ['TEMPORARY']}
        id = Column(Integer, primary_key=True)
        distinguishedName = Column(String(250), nullable=False)
        cn = Column(String(250), nullable=False)
        userPrincipalName = Column(String(250), nullable=False, unique=True)
        accessTemplateId = Column(Integer)
        roleId = Column(Integer)

    engine = create_engine(config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()
    
    Temp.metadata.create_all(bind=engine)
    
    query_result = session.query(Settings).filter_by(id=1).first()

    if query_result == None:
        default_access_template_id = sqlalchemy.sql.null()
        default_role_id = sqlalchemy.sql.null()
    else:
        default_access_template_id = query_result.defaultAccessTemplateId
        default_role_id = query_result.defaultRoleId
        
    for ldap_user in ldap_users:
        temp_user = TempUser(distinguishedName=ldap_user[0], cn=ldap_user[1], userPrincipalName=ldap_user[2],
            accessTemplateId=default_access_template_id, roleId=default_role_id)

        session.add(temp_user)

    session.commit()

    session.execute("CALL updateUsers();")
    session.commit()

    session.execute("CALL openNewTrafficPeriod();")
    session.commit()

    session.close()


if __name__ == '__main__':
    main()