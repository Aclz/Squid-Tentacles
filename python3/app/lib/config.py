import sys
import configparser

config = configparser.ConfigParser()
config.read('/etc/tentacles.conf',encoding='utf8')

MandatorySections = [
    ('SQLAlchemy',['DBConnectionString','DBConnectionPoolRecycleTimeout']),
    ('Network',['WebInterfaceIpAddress']),
    ('LDAP',['Url','BaseDn','Query']),
    ('Authentication',['KeytabFilePath'])
    ]

for Section in MandatorySections:
    if not Section[0] in config:
        sys.exit('Wrong /etc/tentacles.conf format: missing [' + Section[0] + '] section!')

    for param in Section[1]:
        if not param in config[Section[0]]:
            sys.exit('Wrong /etc/tentacles.conf format: missing [' + Section[0] + ']:' + param + ' parameter!')
