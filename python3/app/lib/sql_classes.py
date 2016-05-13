from sqlalchemy import Column, Integer, String, SmallInteger, Boolean, BigInteger, Numeric, Date, Text
from sqlalchemy.schema import ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class UrlList(Base):
    __tablename__ = 'urlLists'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    whitelist = Column(Boolean, nullable=False)
    

class UrlMask(Base):
    __tablename__ = 'urlMasks'
    id = Column(Integer, primary_key=True)
    urlListId = Column(Integer, ForeignKey('urlLists.id'), nullable=False)
    name = Column(String(250), nullable=False)
    
    
class AccessTemplate(Base):
    __tablename__ = 'accessTemplates'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)

    
class AccessTemplateContents(Base):
    __tablename__ = 'accessTemplatesContents'
    id = Column(Integer, primary_key=True)
    accessTemplateId = Column(Integer, ForeignKey('accessTemplates.id'), nullable=False)
    urlListId = Column(Integer, ForeignKey('urlLists.id'), nullable=False)
    orderNumber = Column(SmallInteger, nullable=False)


class UserGroup(Base):
    __tablename__ = 'userGroups'
    id = Column(Integer, primary_key=True)
    distinguishedName = Column(String(250), nullable=False, unique=True)
    
    
class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    
    
class Permission(Base):
    __tablename__ = 'permissions'
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    
    
class RolePermission(Base):
    __tablename__ = 'rolePermissions'
    id = Column(Integer, primary_key=True)
    roleId = Column(Integer, ForeignKey('roles.id'), nullable=False)
    permissionId = Column(Integer, ForeignKey('permissions.id'), nullable=False)


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
    ip = Column(String(15), nullable=False, default='0.0.0.0')
    traffic = Column(BigInteger, nullable=False, default=0)
    accessTemplateId = Column(Integer, ForeignKey('accessTemplates.id'))
    roleId = Column(Integer, ForeignKey('roles.id'))


class AccessLogArchive(Base):
    __tablename__ = 'accessLogArchive'
    id = Column(Integer, primary_key=True)
    date = Column(Date, nullable=False)
    userId = Column(Integer, ForeignKey('users.id'), nullable=False)
    host = Column(String(250))
    traffic = Column(Numeric(15, 2))


class AccessLog(Base):
    __tablename__ = 'accessLog'
    id = Column(Integer, primary_key=True)
    time_since_epoch = Column(Numeric(15, 3))
    http_status_code = Column(String(10))
    http_reply_size = Column(Integer)
    http_url = Column(Text)
    userId = Column(Integer, ForeignKey('users.id'))


class Settings(Base):
    __tablename__ = 'settings'
    id = Column(Integer, primary_key=True)
    defaultAccessTemplateId = Column(Integer, ForeignKey('accessTemplates.id'))
    defaultRoleId = Column(Integer, ForeignKey('roles.id'))
    