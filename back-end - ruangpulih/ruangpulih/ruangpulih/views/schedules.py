# File: views/schedules.py
from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPNotFound
from pyramid.view import view_config
from sqlalchemy.orm import joinedload
from ..models.schedule import Schedule
from ..models.user import User
from ..models.booking import Booking
import uuid
from datetime import datetime

def get_user_id(request):
    user_id = request.authenticated_userid
    if not user_id:
        raise HTTPUnauthorized(json_body={"error": "Unauthorized"})
    return user_id

def get_schedule_or_404(request, schedule_id):
    schedule = request.dbsession.query(Schedule).options(
        joinedload(Schedule.psychologist),
        joinedload(Schedule.bookings).joinedload(Booking.client)
    ).get(schedule_id)
    
    if not schedule:
        raise HTTPNotFound(json_body={"error": "Schedule not found"})
    return schedule

@view_config(route_name='schedules', request_method='GET', renderer='json')
def list_schedules(request):
    schedules_query = request.dbsession.query(Schedule).options(
        joinedload(Schedule.psychologist),
        joinedload(Schedule.bookings).joinedload(Booking.client)
    )

    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    if user.role == 'psychologist':
        schedules_query = schedules_query.filter(Schedule.psychologist_id == user_id)

    schedules = schedules_query.all()
    return [s.to_dict() for s in schedules]

@view_config(route_name='schedules', request_method='POST', renderer='json')
def add_schedule(request):
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)
    
    if not user or user.role != 'psychologist':
        raise HTTPUnauthorized(json_body={"error": "Only psychologists can create schedules"})

    data = request.json_body
    try:
        date = datetime.strptime(data.get("date"), "%Y-%m-%d").date()
        time_slot = datetime.strptime(data.get("time_slot"), "%H:%M").time()
    except Exception:
        raise HTTPBadRequest(json_body={"error": "Invalid date or time format (date=YYYY-MM-DD, time=HH:MM)"})

    new_schedule = Schedule(
        id=str(uuid.uuid4()),
        psychologist_id=user_id,
        date=date,
        time_slot=time_slot,
        is_booked=False
    )
    request.dbsession.add(new_schedule)
    request.dbsession.flush()

    created_schedule = request.dbsession.query(Schedule).options(
        joinedload(Schedule.psychologist),
        joinedload(Schedule.bookings).joinedload(Booking.client)
    ).get(new_schedule.id)

    return created_schedule.to_dict()

@view_config(route_name='schedule_detail', request_method='GET', renderer='json')
def get_schedule(request):
    schedule_id = request.matchdict['id']
    schedule = get_schedule_or_404(request, schedule_id)
    return schedule.to_dict()

@view_config(route_name='schedule_detail', request_method='PUT', renderer='json')
def update_schedule(request):
    schedule_id = request.matchdict['id']
    user_id = get_user_id(request)
    schedule = get_schedule_or_404(request, schedule_id)

    if schedule.psychologist_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to edit this schedule"})

    data = request.json_body
    try:
        if 'date' in data:
            schedule.date = datetime.strptime(data['date'], "%Y-%m-%d").date()
        if 'time_slot' in data:
            schedule.time_slot = datetime.strptime(data['time_slot'], "%H:%M").time()
    except Exception:
        raise HTTPBadRequest(json_body={"error": "Invalid date or time format (date=YYYY-MM-DD, time=HH:MM)"})

    return schedule.to_dict()

@view_config(route_name='schedule_detail', request_method='DELETE', renderer='json')
def delete_schedule(request):
    schedule_id = request.matchdict['id']
    user_id = get_user_id(request)
    schedule = get_schedule_or_404(request, schedule_id)

    if schedule.psychologist_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to delete this schedule"})

    if schedule.is_booked:
        raise HTTPBadRequest(json_body={"error": "Cannot delete schedule that has been booked"})

    request.dbsession.delete(schedule)
    return {"message": "Schedule deleted"}
