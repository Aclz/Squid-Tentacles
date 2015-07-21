"""
Получение списка пользователей AD из LDAP с аутентификацией Kerberos
"""

def get_ldap_users(keytab_file_path,ldap_url,base_dn,ldap_query):
    import os
    import ssl

    import ldap3

    os.environ["KRB5_CLIENT_KTNAME"] = keytab_file_path

    tls = ldap3.Tls(validate=ssl.CERT_NONE,version=ssl.PROTOCOL_TLSv1_2)
    server = ldap3.Server(ldap_url,use_ssl=True,tls=tls)
    connection = ldap3.Connection(server,authentication=ldap3.SASL,sasl_mechanism='GSSAPI')
    connection.bind()

    connection.search(search_base=base_dn,search_filter=ldap_query,search_scope=ldap3.SUBTREE,
        attributes=['cn','userPrincipalName'])

    ad_search = connection.response

    #Отключаемся от LDAP
    connection.unbind()

    #Dictionary пользователей
    users_dict = {}

    #Заполняем наш ассоциативный массив
    for element in ad_search:
        if not element['dn']:
            continue

        if not element['dn'] in users_dict:
            users_dict[element['dn']] = (element['attributes']['cn'],element['attributes']['userPrincipalName'])

    #Превратим dictionary в list of tuples для удобства дальнейшей вставки в MySQL
    return [(dn[dn.upper().find(',OU=') + 1:dn.upper().find(',' + base_dn.upper())],users_dict[dn][0],users_dict[dn][1])
        for dn in users_dict]


def main():
    print("This module is not intended to be used directly!")


if __name__ == '__main__':
    main()