from pyramid.httpexceptions import HTTPBadRequest, HTTPUnauthorized, HTTPNotFound
from pyramid.view import view_config
from sqlalchemy.orm import joinedload, subqueryload
from sqlalchemy import and_, func
from ..models.user import User
from ..models.schedule import Schedule
from ..models.booking import Booking
from ..models.review import Review
from datetime import datetime, date, time

def psychologist_to_dict(psychologist, average_rating=None, total_reviews=None, available_schedules=None):
    """Helper function to format psychologist details into a dictionary."""
    data = {
        'id': str(psychologist.id),
        'username': psychologist.username,
        'email': psychologist.email,
        'role': psychologist.role,
        'average_rating': average_rating,
        'total_reviews': total_reviews,
    }
    if available_schedules is not None:
        data['available_schedules'] = available_schedules
    return data

def schedule_to_dict_simple(schedule):
    """Helper function to format schedule details simply."""
    return {
        'id': str(schedule.id),
        'date': schedule.date.isoformat(),
        'time_slot': schedule.time_slot.strftime('%H:%M'),
        'is_booked': schedule.is_booked,
    }

def review_to_dict_simple(review):
    """Helper function to format review details simply."""
    return {
        'id': str(review.id),
        'booking_id': review.booking_id,
        'rating': review.rating,
        'comment': review.comment,
    }

@view_config(route_name='psychologists_with_available_schedules', request_method='GET', renderer='json')
def get_psychologists_with_available_schedules(request):
    """
    Lists psychologists with their available (unbooked) schedules from today onwards.
    """
    today = datetime.utcnow().date()

    available_schedules_query = request.dbsession.query(Schedule).options(
        joinedload(Schedule.psychologist)
    ).filter(
        and_(
            Schedule.is_booked == False,
            Schedule.date >= today
        )
    ).order_by(
        Schedule.psychologist_id,
        Schedule.date,
        Schedule.time_slot
    )

    all_available_schedules = available_schedules_query.all()

    psychologists_data = {}
    for schedule in all_available_schedules:
        if schedule.psychologist:
            psychologist_id = str(schedule.psychologist.id)
            if psychologist_id not in psychologists_data:
                psychologists_data[psychologist_id] = psychologist_to_dict(schedule.psychologist)
                psychologists_data[psychologist_id]['available_schedules'] = []

            psychologists_data[psychologist_id]['available_schedules'].append(schedule_to_dict_simple(schedule))

    # Average rating and total reviews are not calculated here for the list view
    # as it might be performance-intensive for a large number of psychologists.
    # They are set to None/0 by default in psychologist_to_dict.
    return list(psychologists_data.values())

@view_config(route_name='psychologist_detail', request_method='GET', renderer='json')
def get_psychologist_detail(request):
    """
    Retrieves detailed information for a specific psychologist,
    including their available schedules and reviews.
    """
    psychologist_id = request.matchdict['id']

    psychologist = request.dbsession.query(User).filter(
        and_(User.id == psychologist_id, User.role == 'psychologist')
    ).first()

    if not psychologist:
        raise HTTPNotFound(json_body={"error": "Psychologist not found."})

    today = datetime.utcnow().date()
    available_schedules = request.dbsession.query(Schedule).filter(
        and_(
            Schedule.psychologist_id == psychologist_id,
            Schedule.is_booked == False,
            Schedule.date >= today
        )
    ).order_by(
        Schedule.date,
        Schedule.time_slot
    ).all()

    reviews_data = request.dbsession.query(Review).options(
        joinedload(Review.booking)
    ).join(Booking.schedule).filter(
        Schedule.psychologist_id == psychologist_id
    ).all()

    num_reviews = len(reviews_data)
    average_rating = round(sum(r.rating for r in reviews_data) / num_reviews, 1) if num_reviews > 0 else None

    psychologist_details = psychologist_to_dict(
        psychologist,
        average_rating=average_rating,
        total_reviews=num_reviews,
        available_schedules=[schedule_to_dict_simple(s) for s in available_schedules]
    )

    psychologist_details['reviews'] = [review_to_dict_simple(r) for r in reviews_data]

    return psychologist_details
