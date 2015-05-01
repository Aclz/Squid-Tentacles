from sqlalchemy import Column, Integer, String, SmallInteger, Boolean, BigInteger, Numeric, Date, Text
from sqlalchemy.schema import ForeignKey
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer,primary_key=True)
    distinguishedName = Column(String(250))


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer,primary_key=True)
    groupId = Column(Integer,ForeignKey('groups.id'))
    hidden = Column(Boolean)
    userPrincipalName = Column(String(250))
    cn = Column(String(250))
    status = Column(SmallInteger)
    quota = Column(Integer)
    authMethod = Column(SmallInteger)
    ip = Column(String(15))
    traffic = Column(BigInteger)


class AccessLogArchive(Base):
    __tablename__ = 'accessLogArchive'
    id = Column(Integer,primary_key=True)
    date = Column(Date)
    userId = Column(Integer,ForeignKey('users.id'))
    groupId = Column(Integer,ForeignKey('groups.id'))
    host = Column(String(250))
    traffic = Column(Numeric(15,2))


class AccessLog(Base):
    __tablename__ = 'accessLog'
    id = Column(Integer,primary_key=True)
    time_since_epoch = Column(Numeric(15,3))
    http_status_code = Column(String(10))
    http_reply_size = Column(Integer)
    http_url = Column(Text)
    userId = Column(Integer,ForeignKey('users.id'))