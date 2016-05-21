#!/usr/local/bin/tentacles/python3/bin/python -tt

"""
DB users table update with those got from LDAP-server
"""
from datetime import datetime
from re import finditer

from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

from config import config
from sql_classes import Settings, User, UserGroup


def _manage_groups(session, ldap_users):
    # Get user OUs with all upper level OUs
    ldap_user_ous = set(ldap_users[user_principal_name]['dn'] for user_principal_name in ldap_users)

    ldap_user_all_ous = set(
        ldap_user_ous.union(sum([[ou[i.start() + 1:] for i in finditer(',', ou)] for ou in ldap_user_ous], [])))

    # Get all user groups from DB
    query_result = session.query(UserGroup).all()
    result_list = [row.__dict__ for row in query_result]
    db_user_ous = set(item['distinguishedName'] for item in result_list)

    # Get user OUs with all upper level OUs
    db_user_all_ous = set(
        db_user_ous.union(sum([[ou[i.start() + 1:] for i in finditer(',', ou)] for ou in db_user_ous], [])))

    # These are new OUs to add (including renamed OUs)
    new_ous = set(filter(lambda x: x.casefold() not in map(lambda y: y.casefold(), db_user_ous), ldap_user_all_ous))
    case_modified_ous = set(filter(lambda x: x not in db_user_ous, ldap_user_all_ous)) - new_ous

    # Add new and rename modified (letter case) groups
    for ou in new_ous:
        session.add(UserGroup(distinguishedName=ou))

    for ou in case_modified_ous:
        query_result = session.query(UserGroup).filter(UserGroup.distinguishedName == ou).first()
        setattr(query_result, 'distinguishedName', ou)

    if new_ous.union(case_modified_ous) != set():
        session.commit()


def _manage_users(session, ldap_users):
    # Get user default values
    query_result = session.query(Settings).first()

    if query_result is None:
        default_acl_id = None
        default_role_id = None
    else:
        default_acl_id = query_result.defaultAclId
        default_role_id = query_result.defaultRoleId

    # Get all users from DB
    query_result = session.query(User).all()
    result_list = [row.__dict__ for row in query_result]

    db_users_dict = {}

    for element in result_list:
        db_users_dict[element['userPrincipalName']] = {
            'id': element['id'],
            'cn': element['cn'],
            'hidden': element['hidden'],
            'ip': element['ip'],
            'groupId': element['groupId']
            }

    # Get all user groups from DB
    query_result = session.query(UserGroup).all()
    result_list = [row.__dict__ for row in query_result]

    db_usergroups_dict = {}

    for element in result_list:
        db_usergroups_dict[element['distinguishedName']] = {
            'id': element['id']
            }

    # fill the ldap users groupId
    for user_principal_name in ldap_users:
        ldap_users[user_principal_name]['groupId'] = db_usergroups_dict[ldap_users[user_principal_name]['dn']]['id']

    # Make sets of db and ldap user principal names
    db_user_principal_names = set(user_principal_name for user_principal_name in db_users_dict)
    ldap_user_principal_names = set(user_principal_name for user_principal_name in ldap_users)

    # Make sets of new, preserved and deleted users
    new_user_principal_names = \
        set(filter(lambda x: x not in db_user_principal_names, ldap_user_principal_names))

    preserved_user_principal_names = \
        set(filter(lambda x: x in db_user_principal_names, ldap_user_principal_names))

    deleted_user_principal_names = db_user_principal_names - ldap_user_principal_names

    # Hide deleted users
    for user in deleted_user_principal_names:
        query_result = session.query(User).get(db_users_dict[user]['id'])

        if query_result is None:
            continue

        if query_result.hidden is False or query_result.ip is not None:
            setattr(query_result, 'hidden', True)
            setattr(query_result, 'ip', None)
            session.commit()

    # Update changed users
    for user_principal_name in preserved_user_principal_names:
        do_commit = False

        query_result = session.query(User).get(db_users_dict[user_principal_name]['id'])

        if db_users_dict[user_principal_name]['cn'] != ldap_users[user_principal_name]['cn']:
            setattr(query_result, 'cn', ldap_users[user_principal_name]['cn'])
            do_commit = True

        if db_users_dict[user_principal_name]['groupId'] != ldap_users[user_principal_name]['groupId']:
            setattr(query_result, 'groupId', ldap_users[user_principal_name]['groupId'])
            do_commit = True

        # Set default values for users being unhidden
        if db_users_dict[user_principal_name]['hidden']:
            setattr(query_result, 'hidden', False)
            setattr(query_result, 'aclId', default_acl_id)
            setattr(query_result, 'roleId', default_role_id)
            setattr(query_result, 'status', 0)
            setattr(query_result, 'authMethod', 0)
            setattr(query_result, 'quota', 0)
            setattr(query_result, 'extraQuota', 0)
            do_commit = True

        if do_commit:
            session.commit()

    # Insert new users
    for user_principal_name in new_user_principal_names:
        new_user = User(
            userPrincipalName=user_principal_name,
            cn=ldap_users[user_principal_name]['cn'],
            groupId=ldap_users[user_principal_name]['groupId'],
            aclId=default_acl_id,
            roleId=default_role_id
            )

        session.add(new_user)
        session.commit()


def _open_new_traffic_period(session):
    current_traffic_period = datetime(datetime.today().year, datetime.today().month, 1)

    # Get DB current traffic period
    query_result = session.query(Settings).first()

    # Create initial settings if none found
    if query_result is None:
        db_traffic_period = current_traffic_period
        new_settings = Settings(currentTrafficPeriod=current_traffic_period)
        session.add(new_settings)
        session.commit()
    else:
        db_traffic_period = query_result.currentTrafficPeriod

    # If traffic period didn't just changed - exit
    if db_traffic_period == current_traffic_period:
        return

    try:
        # Update DB traffic period
        setattr(query_result, 'currentTrafficPeriod', current_traffic_period)

        query_result = session.query(User).filter_by(hidden=0).all()

        # Reset user counters, enable locked
        for user in query_result:
            setattr(user, 'traffic', 0)
            setattr(user, 'extraQuota', 0)

            if user.status == 2:
                setattr(user, 'status', 1)

        session.commit()
    except:
        session.rollback()
        raise


def main():
    from get_ldap_users import get_ldap_users

    keytab_file_path = config['Authentication']['KeytabFilePath']
    ldap_url = config['LDAP']['Url']
    base_dn = config['LDAP']['BaseDn']
    ldap_query = config['LDAP']['Query']

    # Get LDAP users from server
    ldap_users = get_ldap_users(keytab_file_path, ldap_url, base_dn, ldap_query)

    # Set up DB connection
    engine = create_engine(
        config['SQLAlchemy']['DBConnectionString'],
        pool_recycle=int(config['SQLAlchemy']['DBConnectionPoolRecycleTimeout']))

    Session = scoped_session(sessionmaker(bind=engine))

    session = Session()

    _manage_groups(session, ldap_users)
    _manage_users(session, ldap_users)
    _open_new_traffic_period(session)

    session.close()


if __name__ == '__main__':
    main()
