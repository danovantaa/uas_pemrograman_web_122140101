from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPNotFound
from pyramid.view import view_config
from sqlalchemy.orm import joinedload
from ..models.booking import Booking
from ..models.schedule import Schedule
from ..models.user import User
import uuid
from datetime import datetime

def get_user_id(request):
    """Extracts and validates the authenticated user ID from the request."""
    user_id = request.authenticated_userid
    if not user_id:
        raise HTTPUnauthorized(json_body={"error": "Unauthorized"})
    return user_id

def get_schedule_or_404(request, schedule_id):
    """Fetches a schedule by ID or raises HTTPNotFound."""
    schedule = request.dbsession.get(Schedule, schedule_id)
    if not schedule:
        raise HTTPNotFound(json_body={"error": "Schedule not found"})
    return schedule

@view_config(route_name='bookings', request_method='GET', renderer='json')
def list_bookings(request):
    """
    Lists bookings based on the authenticated user's role.
    Clients see their own bookings.
    Psychologists see bookings for their schedules.
    """
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    bookings_query = request.dbsession.query(Booking).options(
        joinedload(Booking.client),
        joinedload(Booking.schedule).joinedload(Schedule.psychologist)
    )

    if user.role == 'client':
        bookings_query = bookings_query.filter(Booking.client_id == user_id)
    elif user.role == 'psychologist':
        bookings_query = bookings_query.join(Schedule).filter(Schedule.psychologist_id == user_id)
    else:
        raise HTTPUnauthorized(json_body={"error": "Access denied for this role"})

    bookings = bookings_query.all()
    return [b.to_dict() for b in bookings]

@view_config(route_name='bookings', request_method='POST', renderer='json')
def create_booking(request):
    """Allows clients to create a new booking for an available schedule."""
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    if not user or user.role != 'client':
        raise HTTPUnauthorized(json_body={"error": "Only clients can create bookings"})

    data = request.json_body
    schedule_id = data.get("schedule_id")

    schedule = request.dbsession.query(Schedule).options(
        joinedload(Schedule.bookings)
    ).get(schedule_id)

    if not schedule:
        raise HTTPNotFound(json_body={"error": "Schedule not found"})

    if schedule.is_booked:
        raise HTTPBadRequest(json_body={"error": "Schedule already booked"})

    booking = Booking(
        id=str(uuid.uuid4()),
        client_id=user_id,
        schedule_id=schedule_id,
        status="pending",
        created_at=datetime.utcnow()
    )
    
    schedule.is_booked = True 
    
    request.dbsession.add(booking)
    request.dbsession.flush()

    created_booking = request.dbsession.query(Booking).options(
        joinedload(Booking.client),
        joinedload(Booking.schedule).joinedload(Schedule.psychologist)
    ).get(booking.id)

    return created_booking.to_dict()

@view_config(route_name='booking_detail', request_method='GET', renderer='json')
def get_booking(request):
    """
    Retrieves details of a specific booking.
    Authorization: Clients can view their own, psychologists can view bookings for their schedules.
    """
    booking_id = request.matchdict['id']
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    booking = request.dbsession.query(Booking).options(
        joinedload(Booking.client),
        joinedload(Booking.schedule).joinedload(Schedule.psychologist)
    ).get(booking_id)

    if not booking:
        raise HTTPNotFound(json_body={"error": "Booking not found"})
    
    if user.role == 'client' and booking.client_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to view this booking"})
    elif user.role == 'psychologist' and booking.schedule.psychologist_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to view this booking"})

    return booking.to_dict()

@view_config(route_name='booking_detail', request_method='PUT', renderer='json')
@view_config(route_name='booking_detail', request_method='PATCH', renderer='json')
def update_booking_status(request):
    """
    Updates the status of a booking.
    Authorization: Clients can cancel their own bookings.
    Psychologists can confirm/reject bookings for their schedules.
    """
    booking_id = request.matchdict['id']
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    booking = request.dbsession.query(Booking).options(
        joinedload(Booking.schedule).joinedload(Schedule.psychologist)
    ).get(booking_id)

    if not booking:
        raise HTTPNotFound(json_body={"error": "Booking not found"})

    new_status = request.json_body.get('status')
    if not new_status:
        raise HTTPBadRequest(json_body={"error": "Status field is required."})

    if user.role == 'client':
        if booking.client_id != user_id:
            raise HTTPUnauthorized(json_body={"error": "You do not have permission to modify this booking"})
        
        if new_status != "rejected":
            raise HTTPBadRequest(json_body={"error": "Clients can only cancel their bookings (set status to 'rejected')."})
        
        if booking.status != 'pending':
            raise HTTPBadRequest(json_body={"error": "Only pending bookings can be cancelled by clients."})

    elif user.role == 'psychologist':
        if booking.schedule.psychologist_id != user_id:
            raise HTTPUnauthorized(json_body={"error": "You do not have permission to modify this booking"})
        
        if new_status not in ["pending", "confirmed", "rejected"]:
            raise HTTPBadRequest(json_body={"error": "Invalid status provided."})

        if booking.status == 'confirmed' and new_status == 'pending':
            raise HTTPBadRequest(json_body={"error": "Cannot change confirmed booking back to pending."})
        if booking.status == 'rejected' and new_status != 'rejected':
            raise HTTPBadRequest(json_body={"error": "Cannot change rejected booking status."})
    else:
        raise HTTPUnauthorized(json_body={"error": "Access denied for this role"})

    booking.status = new_status
    
    if new_status == 'confirmed':
        booking.schedule.is_booked = True
    elif new_status == 'rejected':
        booking.schedule.is_booked = False
    elif new_status == 'pending' and not booking.schedule.is_booked:
        booking.schedule.is_booked = True
        
    request.dbsession.flush()

    updated_booking = request.dbsession.query(Booking).options(
        joinedload(Booking.client),
        joinedload(Booking.schedule).joinedload(Schedule.psychologist)
    ).get(booking_id)

    return updated_booking.to_dict()

@view_config(route_name='booking_detail', request_method='DELETE', renderer='json')
def delete_booking(request):
    """
    Deletes a booking.
    Authorization: Clients can delete their own bookings.
    Psychologists can delete any booking on their schedules.
    """
    booking_id = request.matchdict['id']
    user_id = get_user_id(request)
    user = request.dbsession.get(User, user_id)

    booking = request.dbsession.query(Booking).options(
        joinedload(Booking.schedule)
    ).get(booking_id)

    if not booking:
        raise HTTPNotFound(json_body={"error": "Booking not found"})

    if user.role == 'client' and booking.client_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to delete this booking"})
    elif user.role == 'psychologist' and booking.schedule.psychologist_id != user_id:
        raise HTTPUnauthorized(json_body={"error": "You do not have permission to delete this booking"})
    
    booking.schedule.is_booked = False 
    
    request.dbsession.delete(booking)
    return {"message": "Booking deleted successfully"}
