import datetime
import time

from flask import request,jsonify

from sqlalchemy.sql import label
from sqlalchemy import func

from sql_classes import AccessLog,AccessLogArchive


def report_user_traffic_by_hosts(Session):
    if request.method == 'GET':
        mandatory_params = ['userId','dateBeg','dateEnd','limit']

        for param_name in mandatory_params:
            if request.args.get(param_name) == None:
                return jsonify({'success':False,'message':'Absent ' + param_name + ' parameter!'})

        session = Session()

        if request.args.get('limit') == '0':
            query_result = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(func.sum(AccessLogArchive.traffic).desc()).all()
        else:
            query_result = session.query(AccessLogArchive.host,
                label('traffic',func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.userId == request.args.get('userId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.005*1024*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))

        if query_result == None:
            return jsonify(success = False)

        session.close()

        result_array = []

        #Making an array
        for result_row in query_result:
            row_object = {
                'position':len(result_array) + 1,
                'host':result_row.host,
                'traffic':float(round(result_row.traffic/1024/1024,2))
                }

            result_array.append(row_object)

        response = {
            'success':True,
            'items':result_array
            }

        return jsonify(response)


def report_user_traffic_by_dates(Session):
    if request.method == 'GET':
        mandatory_params = ['userId','dateBeg','dateEnd']

        for param_name in mandatory_params:
            if request.args.get(param_name) == None:
                return jsonify({'success':False,'message':'Absent ' + param_name + ' parameter!'})

        session = Session()

        query_result = session.query(AccessLogArchive.date,
            label('traffic',func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.userId == request.args.get('userId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.date).order_by(
            AccessLogArchive.date).all()

        if query_result == None:
            return jsonify(success = False)

        session.close()

        result_array = []

        #Making an array
        for result_row in query_result:
            row_object = {
                'position':len(result_array) + 1,
                'date':result_row.date.isoformat(),
                'traffic':float(round(result_row.traffic/1024/1024,2))
                }

            result_array.append(row_object)

        response = {
            'success':True,
            'items':result_array
            }

        return jsonify(response)


def report_user_day_traffic(Session):
    if request.method == 'GET':
        mandatory_params = ['userId','date','start','limit']

        for param_name in mandatory_params:
            if request.args.get(param_name) == None:
                return jsonify({'success':False,'message':'Absent ' + param_name + ' parameter!'})

        session = Session()

        query_result = session.query(AccessLog).filter(
            AccessLog.userId == request.args.get('userId'),
            AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()),
            AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
                request.args.get('date'),"%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
            AccessLog.http_reply_size > 0.05*1024,
            AccessLog.http_status_code.like('2%')).order_by(
            AccessLog.time_since_epoch)

        row_count = query_result.count()

        query_result = query_result.offset(request.args.get('start')).limit(request.args.get('limit'))

        if query_result == None:
            return jsonify(success = False)

        session.close()

        result_array = []

        #Making an array
        for result_row in query_result:
            row_object = {
                'id':len(result_array) + 1 + int(request.args.get('start')),
                'time':datetime.datetime.fromtimestamp(result_row.time_since_epoch).isoformat(),
                'url':result_row.http_url,
                'traffic':float(round(result_row.http_reply_size/1024/1024,4))
                }

            result_array.append(row_object)

        response = {
            'success':True,
            'total':row_count,
            'items':result_array
            }

        return jsonify(response)
