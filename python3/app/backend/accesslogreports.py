import datetime
import time

from flask import request,jsonify

from sqlalchemy.sql import label
from sqlalchemy import func

from sql_classes import AccessLog,AccessLogArchive


def report_user_traffic_by_hosts(Session):
    if request.method == 'GET':
        mandatoryParams = ['userId','dateBeg','dateEnd','limit']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        if request.args.get('limit') == '0':
            queryResult = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(func.sum(AccessLogArchive.traffic).desc()).all()
        else:
            queryResult = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))

        if queryResult == None:
            return jsonify(success=False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'position':len(resultArray) + 1,
                'host':resultRow.host,
                'traffic':float(round(resultRow.traffic/1024/1024,2))
                }

            resultArray.append(rowObject)

        response={
            'success':True,
            'items':resultArray
            }

        return jsonify(response)


def report_user_traffic_by_dates(Session):
    if request.method == 'GET':
        mandatoryParams = ['userId','dateBeg','dateEnd']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        queryResult = session.query(AccessLogArchive.date,
            label('traffic',func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.userId == request.args.get('userId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.date).order_by(
            AccessLogArchive.date).all()

        if queryResult == None:
            return jsonify(success=False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'position':len(resultArray) + 1,
                'date':resultRow.date.isoformat(),
                'traffic':float(round(resultRow.traffic/1024/1024,2))
                }

            resultArray.append(rowObject)

        response = {
            'success':True,
            'items':resultArray
            }

        return jsonify(response)


def report_user_day_traffic(Session):
    if request.method == 'GET':
        mandatoryParams = ['userId','date','start','limit']

        for paramName in mandatoryParams:
            if request.args.get(paramName) == None:
                return jsonify({'success':False,'message':'Absent ' + paramName + ' parameter!'})

        session = Session()

        queryResult = session.query(AccessLog).filter(
            AccessLog.userId == request.args.get('userId'),
            AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()),
            AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
            AccessLog.http_reply_size > 0.05*1024,
            AccessLog.http_status_code.like('2%')).order_by(
            AccessLog.time_since_epoch)

        rowCount = queryResult.count()

        queryResult = queryResult.offset(request.args.get('start')).limit(request.args.get('limit'))

        if queryResult == None:
            return jsonify(success = False)

        session.close()

        resultArray = []

        #Making an array
        for resultRow in queryResult:
            rowObject = {
                'id':len(resultArray) + 1 + int(request.args.get('start')),
                'time':datetime.datetime.fromtimestamp(resultRow.time_since_epoch).isoformat(),
                'url':resultRow.http_url,
                'traffic':float(round(resultRow.http_reply_size/1024,1))
                }

            resultArray.append(rowObject)

        response = {
            'success':True,
            'total':rowCount,
            'items':resultArray
            }

        return jsonify(response)
