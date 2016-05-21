#!/usr/local/bin/tentacles/python3/bin/python -tt

"""
DB users table update with those got from LDAP-server
Open new traffic period: counters reset, unblocking users who have exceeded quota in previous period
"""
from re import finditer

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

    # Get LDAP users from server
    ldap_users = get_ldap_users(keytab_file_path, ldap_url, base_dn, ldap_query)

    # Create all needed temporary tables
    Temp = declarative_base()

    class TempUser(Temp):
        __tablename__ = 'tempUsers'
        __table_args__ = {'prefixes': ['TEMPORARY']}
        id = Column(Integer, primary_key=True)
        distinguishedName = Column(String(250), nullable=False)
        cn = Column(String(250), nullable=False)
        userPrincipalName = Column(String(250), nullable=False, unique=True)
        aclId = Column(Integer)
        roleId = Column(Integer)

    class TempGroup(Temp):
        __tablename__ = 'tempGroups'
        __table_args__ = {'prefixes': ['TEMPORARY']}
        id = Column(Integer, primary_key=True)
        distinguishedName = Column(String(250), nullable=False)

    engine = create_engine(
        config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    Temp.metadata.create_all(bind=engine)

    # Get user default values
    query_result = session.query(Settings).filter_by(id=1).first()

    if query_result is None:
        default_acl_id = sqlalchemy.sql.null()
        default_role_id = sqlalchemy.sql.null()
    else:
        default_acl_id = query_result.defaultAclId
        default_role_id = query_result.defaultRoleId

    # Fill users temporary table
    for user_principal_name in ldap_users:
        temp_user = TempUser(
            distinguishedName=ldap_users[user_principal_name]['dn'],
            cn=ldap_users[user_principal_name]['cn'],
            userPrincipalName=user_principal_name,
            aclId=default_acl_id,
            roleId=default_role_id)

        session.add(temp_user)

    # Fill user groups temporary table
    user_ous = set(ldap_users[user_principal_name]['dn'] for user_principal_name in ldap_users)
    all_ous = user_ous.union(sum([[ou[i.start() + 1:] for i in finditer(',', ou)] for ou in user_ous], []))

    for ou in all_ous:
        temp_group = TempGroup(distinguishedName=ou)

        session.add(temp_group)

    session.commit()

    # Call SQL server sprocs
    session.execute("CALL updateUsers();")
    session.commit()

    session.execute("CALL openNewTrafficPeriod();")
    session.commit()

    session.close()


if __name__ == '__main__':
    main()
