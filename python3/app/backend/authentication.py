import kerberos

from os import environ
from functools import wraps
from socket import gethostname

from flask import Response
from flask import _request_ctx_stack as stack
from flask import make_response, request

from sql_classes import User
from authorization import check_permissions, get_role_object, get_role_permissions
from config import config

_SERVICE_NAME = None


def get_user_by_principal_name(user_principal_name, Session):
    session = Session()

    query_result = session.query(User).filter_by(userPrincipalName = user_principal_name, hidden = 0).first()

    session.close()

    if query_result is None:
        return None

    user_object = {
        'id': query_result.id,
        'cn': query_result.cn,
        'userPrincipalName': query_result.userPrincipalName,
        'status': query_result.status,
        'quota': query_result.quota,
        'authMethod': query_result.authMethod,
        'ip': query_result.ip,
        'traffic': round(query_result.traffic/1024/1024, 2),
        'accessTemplateId': query_result.accessTemplateId,
        'roleId': query_result.roleId
        }

    return user_object


def init_kerberos(app, service='HTTP', hostname=gethostname()):
    '''
    Configure the GSSAPI service name, and validate the presence of the
    appropriate principal in the kerberos keytab.

    :param app: a flask application
    :type app: flask.Flask
    :param service: GSSAPI service name
    :type service: str
    :param hostname: hostname the service runs under
    :type hostname: str
    '''
    if config['Authentication']['Enabled'] == 'False':
        return
        
    global _SERVICE_NAME
    _SERVICE_NAME = "%s@%s" % (service, hostname)

    if 'KRB5_KTNAME' not in environ:
        app.logger.warn("Kerberos: set KRB5_KTNAME to your keytab file")
    else:
        try:
            principal = kerberos.getServerPrincipalDetails(service, hostname)
        except kerberos.KrbError as exc:
            app.logger.warn("Kerberos: %s" % exc.message[0])
        else:
            app.logger.info("Kerberos: server is %s" % principal)


def _unauthorized():
    '''
    Indicate that authentication is required
    '''
    return Response('Unauthorized', 401, {'WWW-Authenticate': 'Negotiate'})


def _forbidden():
    '''
    Indicate a complete authentication failure
    '''
    return Response('Forbidden', 403)


def _gssapi_authenticate(token):
    '''
    Performs GSSAPI Negotiate Authentication

    On success also stashes the server response token for mutual authentication
    at the top of request context with the name kerberos_token, along with the
    authenticated user principal with the name kerberos_user.

    @param token: GSSAPI Authentication Token
    @type token: str
    @returns gssapi return code or None on failure
    @rtype: int or None
    '''
    state = None
    ctx = stack.top
    try:
        rc, state = kerberos.authGSSServerInit(_SERVICE_NAME)
        
        if rc != kerberos.AUTH_GSS_COMPLETE:
            return None
            
        rc = kerberos.authGSSServerStep(state, token)
        
        if rc == kerberos.AUTH_GSS_COMPLETE:
            ctx.kerberos_token = kerberos.authGSSServerResponse(state)
            ctx.kerberos_user = kerberos.authGSSServerUserName(state)
            return rc
        elif rc == kerberos.AUTH_GSS_CONTINUE:
            return kerberos.AUTH_GSS_CONTINUE
        else:
            return None
    except kerberos.GSSError:
        return None
    finally:
        if state:
            kerberos.authGSSServerClean(state)

def authorization(permission_list, session, return_user_properties = False):
    '''
    Require that the wrapped view function only be called by users
    authenticated with Kerberos. The view function will have the authenticated
    users principal passed to it as its first argument.

    :param function: flask view function
    :type function: function
    :returns: decorated function
    :rtype: function
    '''
    def decorator(function):
        @wraps(function)
        def decorated(*args, **kwargs):
            if config['Authentication']['Enabled'] == 'False':
                user_properties = {
                    'user_object': {
                        'id': None,
                        'cn': 'Аутентификация отключена'
                        },
                    'user_permissions': get_role_permissions(0, session)
                    }

                if return_user_properties:
                    response = function(user_properties, *args, **kwargs)
                else:
                    response = function(*args, **kwargs)

                response = make_response(response)
                
                return response
                
            header = request.headers.get("Authorization")
        
            if header:
                ctx = stack.top
                token = ''.join(header.split()[1:])
                rc = _gssapi_authenticate(token)
                
                user_principal_name = ctx.kerberos_user
                user_object = get_user_by_principal_name(user_principal_name, session)
                
                if return_user_properties:
                    role_object = get_role_object(user_object['roleId'], session)
                    role_permissions = get_role_permissions(role_object['id'], session)
                    
                    user_properties = {
                        'user_object': user_object,
                        'user_permissions': role_permissions
                        }
                
                if rc == kerberos.AUTH_GSS_COMPLETE:
                    if user_object is None:
                        return _forbidden()
                                            
                    if check_permissions(user_object['id'], permission_list, session):
                        if return_user_properties:
                            response = function(user_properties, *args, **kwargs)
                        else:
                            response = function(*args, **kwargs)
                    
                        response = make_response(response)
                
                        if ctx.kerberos_token is not None:
                            response.headers['WWW-Authenticate'] = ' '.join(['negotiate', ctx.kerberos_token])
                        
                        return response
                    else:
                        return _forbidden()                   
                elif rc != kerberos.AUTH_GSS_CONTINUE:
                    return  _forbidden()                    
            return _unauthorized()
        return decorated        
    return decorator
