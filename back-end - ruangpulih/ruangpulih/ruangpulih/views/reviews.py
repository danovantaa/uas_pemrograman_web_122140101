from pyramid.view import view_config
from pyramid.httpexceptions import HTTPNotFound, HTTPUnauthorized
from ..models.review import Review
from ..models.booking import Booking
import uuid

def get_user_id(request):
    user_id = request.authenticated_userid
    if not user_id:
        raise HTTPUnauthorized(json_body={"error": "Unauthorized"})
    return user_id

@view_config(route_name='reviews', request_method='POST', renderer='json')
def create_review(request):
    user_id = get_user_id(request)
    data = request.json_body
    booking_id = data.get("booking_id")
    rating = data.get("rating")
    comment = data.get("comment", "")

    booking = request.dbsession.get(Booking, booking_id)
    if not booking or booking.client_id != user_id:
        raise HTTPNotFound(json_body={"error": "Booking not found or not yours"})

    review = Review(
        id=str(uuid.uuid4()),
        booking_id=booking_id,
        rating=rating,
        comment=comment
    )
    request.dbsession.add(review)
    return review.to_dict()

@view_config(route_name='reviews', request_method='GET', renderer='json')
def list_reviews(request):
    reviews = request.dbsession.query(Review).all()
    return [r.to_dict() for r in reviews]
