import datetime
import time

from flask import request, jsonify

from sqlalchemy import func
from sqlalchemy.sql import label
from sqlalchemy.orm import aliased

from sql_classes import AccessLog, AccessLogArchive, User, UserGroup


def report_user_traffic_by_hosts(Session):
    mandatory_params = ['userId', 'dateBeg', 'dateEnd', 'limit']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()

    if request.args.get('limit') == '0':
        query_result = session.query(AccessLogArchive.host,
            label('traffic', func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.userId == request.args.get('userId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
            func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(func.sum(AccessLogArchive.traffic).desc()).all()
    else:
        query_result = session.query(AccessLogArchive.host,
            label('traffic', func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.userId == request.args.get('userId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).group_by(AccessLogArchive.host).having(
            func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(
            func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'position': len(result_list) + 1,
            'host': result_row.host,
            'traffic': float(round(result_row.traffic/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'data': result_list
        }

    return jsonify(response)
    
    
def report_group_traffic_by_hosts(Session):
    mandatory_params = ['groupId', 'dateBeg', 'dateEnd', 'limit']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()
    
    if request.args.get('groupId') != '0':
        if request.args.get('limit') == '0':
            query_result = session.query(AccessLogArchive.host,
                label('traffic', func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.groupId == request.args.get('groupId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).\
                group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).all()
        else:
            query_result = session.query(AccessLogArchive.host,
                label('traffic', func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.groupId == request.args.get('groupId'),
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).\
                group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))
    else:
        if request.args.get('limit') == '0':
            query_result = session.query(AccessLogArchive.host,
                label('traffic', func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).\
                group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).all()
        else:
            query_result = session.query(AccessLogArchive.host,
                label('traffic', func.sum(AccessLogArchive.traffic))).filter(
                AccessLogArchive.date >= request.args.get('dateBeg'),
                AccessLogArchive.date <= request.args.get('dateEnd')).\
                group_by(AccessLogArchive.host).having(
                func.sum(AccessLogArchive.traffic) > 0.05*1024).order_by(
                func.sum(AccessLogArchive.traffic).desc()).limit(request.args.get('limit'))

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'position': len(result_list) + 1,
            'host': result_row.host,
            'traffic': float(round(result_row.traffic/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'data': result_list
        }

    return jsonify(response)


def report_user_traffic_by_dates(Session):
    mandatory_params = ['userId', 'dateBeg', 'dateEnd']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()

    query_result = session.query(AccessLogArchive.date,
        label('traffic', func.sum(AccessLogArchive.traffic))).\
        filter(AccessLogArchive.userId == request.args.get('userId'), AccessLogArchive.date >= request.args.get('dateBeg'),
        AccessLogArchive.date <= request.args.get('dateEnd')).\
        group_by(AccessLogArchive.date).\
        order_by(AccessLogArchive.date).all()

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'position': len(result_list) + 1,
            'date': result_row.date.isoformat(),
            'traffic': float(round(result_row.traffic/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'data': result_list
        }

    return jsonify(response)
    
    
def report_group_traffic_by_dates(Session):
    mandatory_params = ['groupId', 'dateBeg', 'dateEnd']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()
    
    if request.args.get('groupId') != '0':
        query_result = session.query(AccessLogArchive.date,
            label('traffic', func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.groupId == request.args.get('groupId'),
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).\
            group_by(AccessLogArchive.date).having(
            func.sum(AccessLogArchive.traffic) > 0.05*1024).\
            order_by(AccessLogArchive.date).all()
    else:
        query_result = session.query(AccessLogArchive.date,
            label('traffic', func.sum(AccessLogArchive.traffic))).filter(
            AccessLogArchive.date >= request.args.get('dateBeg'),
            AccessLogArchive.date <= request.args.get('dateEnd')).\
            group_by(AccessLogArchive.date).having(
            func.sum(AccessLogArchive.traffic) > 0.05*1024).\
            order_by(AccessLogArchive.date).all()

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'position': len(result_list) + 1,
            'date': result_row.date.isoformat(),
            'traffic': float(round(result_row.traffic/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'data': result_list
        }

    return jsonify(response)


def report_user_day_traffic(Session):
    mandatory_params = ['userId', 'date', 'start', 'limit']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()

    query_result = session.query(AccessLog).filter(
        AccessLog.userId == request.args.get('userId'),
        AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
            request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()),
        AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
            request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
        AccessLog.http_reply_size > 0.05*1024,
        AccessLog.http_status_code.like('2%')).order_by(
        AccessLog.time_since_epoch)

    row_count = query_result.count()

    query_result = query_result.offset(request.args.get('start')).limit(request.args.get('limit'))

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'id': len(result_list) + 1 + int(request.args.get('start')),
            'time': datetime.datetime.fromtimestamp(result_row.time_since_epoch).isoformat(),
            'url': result_row.http_url,
            'traffic': float(round(result_row.http_reply_size/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'total': row_count,
        'data': result_list
        }

    return jsonify(response)


def report_group_day_traffic(Session):
    mandatory_params = ['groupId', 'date', 'start', 'limit']

    for param_name in mandatory_params:
        if request.args.get(param_name) == None:
            return jsonify({'success': False, 'message': 'Absent ' + param_name + ' parameter!'})

    session = Session()

    if request.args.get('groupId') != '0':
        query_result = session.query(AccessLog).filter(
            AccessLog.groupId == request.args.get('groupId'),
            AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
                request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()),
            AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
                request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
            AccessLog.http_reply_size > 0.05*1024,
            AccessLog.http_status_code.like('2%')).order_by(
            AccessLog.time_since_epoch)
    else:
        query_result = session.query(AccessLog).filter(
            AccessLog.time_since_epoch >= time.mktime(datetime.datetime.strptime(
                request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()),
            AccessLog.time_since_epoch <= time.mktime(datetime.datetime.strptime(
                request.args.get('date'), "%Y-%m-%dT%H:%M:%S").date().timetuple()) + 60*60*24,
            AccessLog.http_reply_size > 0.05*1024,
            AccessLog.http_status_code.like('2%')).order_by(
            AccessLog.time_since_epoch)

    row_count = query_result.count()

    query_result = query_result.offset(request.args.get('start')).limit(request.args.get('limit'))

    if query_result == None:
        return jsonify(success = False)

    session.close()

    result_list = []

    for result_row in query_result:
        row_object = {
            'id': len(result_list) + 1 + int(request.args.get('start')),
            'time': datetime.datetime.fromtimestamp(result_row.time_since_epoch).isoformat(),
            'url': result_row.http_url,
            'traffic': float(round(result_row.http_reply_size/1024/1024, 4))
            }

        result_list.append(row_object)

    response = {
        'success': True,
        'total': row_count,
        'data': result_list
        }

    return jsonify(response)