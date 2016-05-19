from sql_classes import EventLog


def log_event(Session, author_id, action, tablename, object_id, fieldname, old_val, new_val):
    session = Session()

    new_log_event = EventLog(
        authorId=author_id, action=action, tablename=tablename,
        objectId=object_id, fieldname=fieldname, oldVal=old_val, newVal=new_val)

    try:
        session.add(new_log_event)
        session.commit()

        return True
    except Exception as e:
        return False
    finally:
        session.close()
