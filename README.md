# Squid Tentacles
Squid Tentacles v0.8x (beta)


User management subsystem for Squid and Active Directory users:

    1. Tight integration with Active Directory (Single sign-on, Kerberos auth)
    2. Relational database access log and user data storage
    3. Regexp Squid URL-redirector with user account-based and IP-based authentication
    4. User traffic quotas with account lock on exceed
    5. Versatile traffic reports


Software:

    Squid version 3.2+
    Backend: nginx, uWSGI, Python3 (Flask, Ldap3, SQLAlchemy), MySQL
    Frontend: Ext JS 6 framework GPL