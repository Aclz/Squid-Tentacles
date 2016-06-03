# Squid Tentacles
Squid Tentacles v0.8x (beta)

WARNING: Currently only russian interface present. English version coming soon!

User management subsystem for Squid and Active Directory environment:

    1. Tight integration with Active Directory (Kerberos SSO)
    2. Relational database access log and user data storage
    3. Regexp Squid URL-redirector with user account-based and IP-based authentication
    4. User traffic quotas with account lock on exceed
    5. Traffic reports


Software:

    Squid version 3.2+
    Backend: nginx, uWSGI, Python3 (Flask, Ldap3, SQLAlchemy), MySQL
    Frontend: Ext JS 6 framework (GPLv3)