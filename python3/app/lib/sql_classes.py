from sqlalchemy import Column, Integer, String, CHAR, SmallInteger, Boolean, BigInteger, Numeric, Date, Text, Index
from sqlalchemy.schema import ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()



class AccessLog(Base):
    __tablename__ = 'accessLog'
    id = Column(Integer, primary_key=True)
    time_since_epoch = Column(Numeric(15, 3))
    time_response = Column(Integer)
    ip_client = Column(CHAR(15))
    ip_server = Column(CHAR(15))
    http_status_code = Column(String(10))
    http_reply_size = Column(Integer)
    http_method = Column(String(50))
    http_url = Column(Text)
    http_username = Column(String(100))
    http_mime_type = Column(String(50))
    squid_hier_status = Column(String(50))
    squid_request_status = Column(String(50))
    userId = Column(Integer, ForeignKey('users.id'))
    archived = Column(Boolean)
    Index('ix_userId_time', 'userId', 'time_since_epoch')
    Index('ix_time', 'time_since_epoch')
    Index('ix_archived', 'date', 'userId')
    

class AccessLogArchive(Base):
    __tablename__ = 'accessLogArchive'
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    userId = Column(Integer, ForeignKey('users.id'), nullable=False)
    host = Column(String(255))
    traffic = Column(BigInteger)
    Index('ix_date_userId', 'date', 'userId')
    Index('ix_userId', 'userId')

    
class AccessTemplate(Base):
    __tablename__ = 'accessTemplates'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    Index('ux_name', 'name', unique=True)
    
    
class AccessTemplateContents(Base):
    __tablename__ = 'accessTemplatesContents'
    id = Column(Integer, primary_key=True)
    accessTemplateId = Column(Integer, ForeignKey('accessTemplates.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    urlListId = Column(Integer, ForeignKey('urlLists.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    orderNumber = Column(SmallInteger, nullable=False)
    Index('ux_accessTemplateId_urlListId', 'accessTemplateId', 'urlListId', unique=True)
    #Index('ix_urlListId', 'urlListId')
    
    
class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    Index('ux_name', 'name', unique=True)
    
    
class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    Index('ux_name', 'name', unique=True)
    
    
class RolePermission(Base):
    __tablename__ = 'rolePermissions'
    id = Column(Integer, primary_key=True)
    roleId = Column(Integer, ForeignKey('roles.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    permissionId = Column(Integer, ForeignKey('permissions.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    Index('ux_roleId_permissionId', 'roleId', 'permissionId', unique=True)
    #Index('ix_permissionId', 'permissionId')


class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True)
    defaultAccessTemplateId = Column(Integer, ForeignKey('accessTemplates.id'))
    defaultRoleId = Column(Integer, ForeignKey('roles.id'))
    #Index('ix_defaultAccessTemplate', 'defaultAccessTemplateId')
    #Index('ix_defaultRoleId', 'defaultRoleId')
    

class UrlList(Base):
    __tablename__ = 'urlLists'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    whitelist = Column(Boolean, nullable=False)
    Index('ux_name', 'name', unique=True)
    

class UrlMask(Base):
    __tablename__ = 'urlMasks'
    id = Column(Integer, primary_key=True)
    urlListId = Column(Integer, ForeignKey('urlLists.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    name = Column(String(250), nullable=False)
    Index('ux_urlListId_name', 'urlListId', 'name', unique=True)
    
    
class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    groupId = Column(Integer, ForeignKey('userGroups.id'), nullable=False)
    hidden = Column(Boolean, nullable=False, default=False)
    userPrincipalName = Column(String(250), nullable=False, unique=True)
    cn = Column(String(250), nullable=False)
    status = Column(SmallInteger, nullable=False, default=0)
    quota = Column(Integer, nullable=False, default=0)
    authMethod = Column(SmallInteger, nullable=False, default=0)
    ip = Column(String(15))
    traffic = Column(BigInteger, nullable=False, default=0)
    accessTemplateId = Column(Integer, ForeignKey('accessTemplates.id'))
    roleId = Column(Integer, ForeignKey('roles.id'))
    Index('ux_userPrincipalName', 'userPrincipalName', unique=True)
    Index('ux_ip', 'ip', unique=True)
    Index('ix_groupId', 'groupId')
    #Index('ix_accessTemplateId', 'accessTemplateId')
    #Index('ix_roleId', 'roleId')
    
    
class UserGroup(Base):
    __tablename__ = 'userGroups'
    id = Column(Integer, primary_key=True)
    distinguishedName = Column(String(255), nullable=False, unique=True)
    Index('ux_distinguishedName', 'distinguishedName', unique=True)
