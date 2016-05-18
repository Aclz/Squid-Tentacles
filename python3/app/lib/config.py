import sys
import configparser


config = configparser.ConfigParser()
config.read('/etc/tentacles.conf', encoding='utf8')

mandatory_sections = [
    ('SQLAlchemy', ['DBConnectionString', 'DBConnectionPoolRecycleTimeout']),
    ('Network', ['WebInterfaceIpAddress']),
    ('LDAP', ['Url', 'BaseDn', 'Query']),
    ('Authentication', ['Enabled', 'KeytabFilePath', 'ServerPrincipalName', 'DefaultDomainName']),
    ('Authorization', ['Enabled'])
    ]

for section in mandatory_sections:
    if not section[0] in config:
        sys.exit('Wrong /etc/tentacles.conf format: missing [' + section[0] + '] section!')

    for param in section[1]:
        if param not in config[section[0]]:
            sys.exit('Wrong /etc/tentacles.conf format: missing [' + section[0] + ']:' + param + ' parameter!')
