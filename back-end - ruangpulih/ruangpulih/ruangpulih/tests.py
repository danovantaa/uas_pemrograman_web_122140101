import unittest
import transaction
from datetime import date, time, datetime
from pyramid import testing
from pyramid.httpexceptions import HTTPNotFound, HTTPUnauthorized, HTTPBadRequest, HTTPConflict
from sqlalchemy.exc import IntegrityError
import uuid

# Import models
from .models.meta import Base
from .models.user import User
from .models.schedule import Schedule
from .models.booking import Booking
from .models.review import Review

# Import views
from .views.auth import register, login, logout
from .views.schedules import list_schedules, add_schedule, get_schedule, update_schedule, delete_schedule
from .views.bookings import list_bookings, create_booking, get_booking, update_booking_status, delete_booking
from .views.reviews import create_review, list_reviews
from .views.pyschologist import get_psychologists_with_available_schedules, get_psychologist_detail


def dummy_request(dbsession, authenticated_userid=None, json_body=None, matchdict=None):
    """
    Creates a dummy request object for testing Pyramid views.
    """
    req = testing.DummyRequest(dbsession=dbsession, json_body=json_body, matchdict=matchdict)
    req.authenticated_userid = authenticated_userid
    req.response = testing.DummyResponse() # Needed for headers in login/logout
    req.registry.settings = {'tm.manager_hook': 'pyramid_tm.explicit_manager'} # Required for tm.begin() in main
    req.tm = transaction.manager # Attach transaction manager
    return req


class BaseTest(unittest.TestCase):
    """Base class for all tests, handling database setup and teardown."""
    def setUp(self):
        self.config = testing.setUp(settings={
            'sqlalchemy.url': 'sqlite:///:memory:' # Use in-memory SQLite for fast tests
        })
        self.config.include('.models')
        settings = self.config.get_settings()

        from .models import (
            get_engine,
            get_session_factory,
            get_tm_session,
        )

        self.engine = get_engine(settings)
        session_factory = get_session_factory(self.engine)
        self.session = get_tm_session(session_factory, transaction.manager)

        # Create all tables
        Base.metadata.create_all(self.engine)

        # Start a transaction for each test
        self.transaction = transaction.begin()

        # Create dummy users for testing
        self.psychologist_user = User(
            id=str(uuid.uuid4()),
            username="test_psychologist",
            email="psy@example.com",
            role="psychologist"
        )
        self.psychologist_user.set_password("psy_pass")
        self.session.add(self.psychologist_user)

        self.client_user = User(
            id=str(uuid.uuid4()),
            username="test_client",
            email="client@example.com",
            role="client"
        )
        self.client_user.set_password("client_pass")
        self.session.add(self.client_user)
        self.session.flush() # Flush to ensure IDs are available

        # Create dummy schedules
        self.schedule_psy_available = Schedule(
            id=str(uuid.uuid4()),
            psychologist_id=self.psychologist_user.id,
            date=date(2025, 12, 25),
            time_slot=time(10, 0),
            is_booked=False
        )
        self.session.add(self.schedule_psy_available)

        self.schedule_psy_booked = Schedule(
            id=str(uuid.uuid4()),
            psychologist_id=self.psychologist_user.id,
            date=date(2025, 12, 26),
            time_slot=time(11, 0),
            is_booked=True
        )
        self.session.add(self.schedule_psy_booked)
        self.session.flush()

        # Create a dummy booking for the booked schedule
        self.booking_client_confirmed = Booking(
            id=str(uuid.uuid4()),
            client_id=self.client_user.id,
            schedule_id=self.schedule_psy_booked.id,
            status="confirmed",
            created_at=datetime.utcnow()
        )
        self.session.add(self.booking_client_confirmed)
        self.session.flush()

        # Create a dummy review for the confirmed booking
        self.review_client = Review(
            id=str(uuid.uuid4()),
            booking_id=self.booking_client_confirmed.id,
            rating=5,
            comment="Great session!"
        )
        self.session.add(self.review_client)
        self.session.flush()


    def tearDown(self):
        # Abort the transaction to roll back any changes made during the test
        self.transaction.abort()
        testing.tearDown()
        # Drop all tables to ensure a clean slate for the next test run
        Base.metadata.drop_all(self.engine)


class TestAuthViews(BaseTest):
    """Tests for authentication views (register, login, logout)."""

    def test_register_success(self):
        request = dummy_request(self.session, json_body={
            'username': 'new_user',
            'email': 'new@example.com',
            'password': 'password123',
            'role': 'client'
        })
        response = register(request)
        self.assertEqual(response['message'], 'Registration successful')
        self.assertIn('user', response)
        self.assertEqual(response['user']['username'], 'new_user')
        self.assertEqual(response['user']['role'], 'client')

    def test_register_missing_fields(self):
        request = dummy_request(self.session, json_body={
            'username': 'new_user',
            'email': 'new@example.com',
            'role': 'client'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            register(request)
        self.assertIn('Missing fields: password', cm.exception.json_body['error'])

    def test_register_invalid_role(self):
        request = dummy_request(self.session, json_body={
            'username': 'new_user',
            'email': 'new@example.com',
            'password': 'password123',
            'role': 'admin'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            register(request)
        self.assertIn('Invalid role: admin', cm.exception.json_body['error'])

    def test_register_username_exists(self):
        request = dummy_request(self.session, json_body={
            'username': self.client_user.username,
            'email': 'another@example.com',
            'password': 'password123',
            'role': 'client'
        })
        with self.assertRaises(HTTPConflict) as cm:
            register(request)
        self.assertIn('Username already exists', cm.exception.json_body['error'])

    def test_register_email_exists(self):
        request = dummy_request(self.session, json_body={
            'username': 'another_user',
            'email': self.client_user.email,
            'password': 'password123',
            'role': 'client'
        })
        with self.assertRaises(HTTPConflict) as cm:
            register(request)
        self.assertIn('Email already exists', cm.exception.json_body['error'])

    def test_login_success(self):
        request = dummy_request(self.session, json_body={
            'email': self.client_user.email,
            'password': 'client_pass'
        })
        response = login(request)
        self.assertEqual(response.json_body['message'], 'Login successful')
        self.assertIn('user', response.json_body)
        self.assertEqual(response.json_body['user']['email'], self.client_user.email)
        self.assertIn('Set-Cookie', response.headers)

    def test_login_invalid_credentials(self):
        request = dummy_request(self.session, json_body={
            'email': self.client_user.email,
            'password': 'wrong_pass'
        })
        with self.assertRaises(HTTPUnauthorized) as cm:
            login(request)
        self.assertIn('Invalid credentials', cm.exception.json_body['error'])

    def test_login_user_not_found(self):
        request = dummy_request(self.session, json_body={
            'email': 'nonexistent@example.com',
            'password': 'password123'
        })
        with self.assertRaises(HTTPUnauthorized) as cm:
            login(request)
        self.assertIn('Invalid credentials', cm.exception.json_body['error'])

    def test_login_missing_fields(self):
        request = dummy_request(self.session, json_body={
            'email': self.client_user.email
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            login(request)
        self.assertIn('Missing fields: password', cm.exception.json_body['error'])

    def test_logout_success(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id)
        response = logout(request)
        self.assertEqual(response.json_body['message'], 'Logout successful')
        self.assertIn('Set-Cookie', response.headers) # Should contain headers to clear cookie


class TestScheduleViews(BaseTest):
    """Tests for schedule views."""

    def test_list_schedules_psychologist(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id)
        response = list_schedules(request)
        self.assertEqual(len(response), 2) # Should see only their own schedules
        self.assertTrue(all(s['psychologist_id'] == self.psychologist_user.id for s in response))

    def test_list_schedules_client(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id)
        response = list_schedules(request)
        self.assertEqual(len(response), 2) # Clients see all schedules
        self.assertTrue(any(s['psychologist_id'] == self.psychologist_user.id for s in response))

    def test_list_schedules_unauthorized(self):
        request = dummy_request(self.session) # No authenticated user
        with self.assertRaises(HTTPUnauthorized):
            list_schedules(request)

    def test_add_schedule_success(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, json_body={
            'date': '2025-07-01',
            'time_slot': '16:00'
        })
        response = add_schedule(request)
        self.assertIn('id', response)
        self.assertEqual(response['date'], '2025-07-01')
        self.assertEqual(response['time_slot'], '16:00')
        self.assertEqual(response['psychologist_id'], self.psychologist_user.id)
        self.assertFalse(response['is_booked'])

    def test_add_schedule_unauthorized(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'date': '2025-07-01',
            'time_slot': '16:00'
        })
        with self.assertRaises(HTTPUnauthorized):
            add_schedule(request)

    def test_add_schedule_invalid_format(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, json_body={
            'date': '01-07-2025', # Invalid format
            'time_slot': '16:00'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            add_schedule(request)
        self.assertIn('Invalid date or time format', cm.exception.json_body['error'])

    def test_get_schedule_success(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.schedule_psy_available.id})
        response = get_schedule(request)
        self.assertEqual(response['id'], self.schedule_psy_available.id)
        self.assertEqual(response['date'], '2025-12-25')

    def test_get_schedule_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': 'nonexistent_id'})
        with self.assertRaises(HTTPNotFound):
            get_schedule(request)

    def test_update_schedule_success(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.schedule_psy_available.id}, json_body={
            'time_slot': '11:30'
        })
        response = update_schedule(request)
        self.assertEqual(response['id'], self.schedule_psy_available.id)
        self.assertEqual(response['time_slot'], '11:30')
        updated_schedule = self.session.get(Schedule, self.schedule_psy_available.id)
        self.assertEqual(updated_schedule.time_slot, time(11, 30))

    def test_update_schedule_unauthorized(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.schedule_psy_available.id}, json_body={
            'time_slot': '11:30'
        })
        with self.assertRaises(HTTPUnauthorized):
            update_schedule(request)

    def test_update_schedule_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': 'nonexistent_id'}, json_body={
            'time_slot': '11:30'
        })
        with self.assertRaises(HTTPNotFound):
            update_schedule(request)

    def test_delete_schedule_success(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.schedule_psy_available.id})
        response = delete_schedule(request)
        self.assertEqual(response['message'], 'Schedule deleted')
        self.assertIsNone(self.session.get(Schedule, self.schedule_psy_available.id))

    def test_delete_schedule_unauthorized(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.schedule_psy_available.id})
        with self.assertRaises(HTTPUnauthorized):
            delete_schedule(request)

    def test_delete_schedule_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': 'nonexistent_id'})
        with self.assertRaises(HTTPNotFound):
            delete_schedule(request)

    def test_delete_booked_schedule_fails(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.schedule_psy_booked.id})
        with self.assertRaises(HTTPBadRequest) as cm:
            delete_schedule(request)
        self.assertIn('Cannot delete schedule that has been booked', cm.exception.json_body['error'])


class TestBookingViews(BaseTest):
    """Tests for booking views."""

    def test_list_bookings_client(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id)
        response = list_bookings(request)
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]['client_id'], self.client_user.id)
        self.assertIn('client_details', response[0])
        # self.assertIn('schedule_details', response[0]) # Removed as per backend model

    def test_list_bookings_psychologist(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id)
        response = list_bookings(request)
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]['schedule_id'], self.schedule_psy_booked.id)
        self.assertIn('client_details', response[0])
        # self.assertIn('schedule_details', response[0]) # Removed as per backend model

    def test_list_bookings_unauthorized(self):
        request = dummy_request(self.session)
        with self.assertRaises(HTTPUnauthorized):
            list_bookings(request)

    def test_create_booking_success(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'schedule_id': self.schedule_psy_available.id
        })
        response = create_booking(request)
        self.assertIn('id', response)
        self.assertEqual(response['client_id'], self.client_user.id)
        self.assertEqual(response['schedule_id'], self.schedule_psy_available.id)
        self.assertEqual(response['status'], 'pending')
        self.assertTrue(self.session.get(Schedule, self.schedule_psy_available.id).is_booked)

    def test_create_booking_unauthorized_role(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, json_body={
            'schedule_id': self.schedule_psy_available.id
        })
        with self.assertRaises(HTTPUnauthorized):
            create_booking(request)

    def test_create_booking_schedule_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'schedule_id': 'nonexistent_schedule'
        })
        with self.assertRaises(HTTPNotFound):
            create_booking(request)

    def test_create_booking_schedule_already_booked(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'schedule_id': self.schedule_psy_booked.id
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            create_booking(request)
        self.assertIn('Schedule already booked', cm.exception.json_body['error'])

    def test_get_booking_client_success(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.booking_client_confirmed.id})
        response = get_booking(request)
        self.assertEqual(response['id'], self.booking_client_confirmed.id)
        self.assertEqual(response['client_id'], self.client_user.id)
        self.assertIn('client_details', response)
        self.assertIn('schedule_details', response) # This assertion remains as get_booking explicitly loads schedule_details

    def test_get_booking_psychologist_success(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.booking_client_confirmed.id})
        response = get_booking(request)
        self.assertEqual(response['id'], self.booking_client_confirmed.id)
        self.assertEqual(response['client_id'], self.client_user.id)
        self.assertIn('client_details', response)
        self.assertIn('schedule_details', response) # This assertion remains as get_booking explicitly loads schedule_details

    def test_get_booking_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': 'nonexistent_booking'})
        with self.assertRaises(HTTPNotFound):
            get_booking(request)

    def test_get_booking_client_unauthorized_other_booking(self):
        # Create another client and booking
        other_client = User(id=str(uuid.uuid4()), username="other_client", email="other@example.com", role="client")
        other_client.set_password("pass")
        self.session.add(other_client)
        other_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 12, 27), time_slot=time(9,0), is_booked=True)
        self.session.add(other_schedule)
        other_booking = Booking(id=str(uuid.uuid4()), client_id=other_client.id, schedule_id=other_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(other_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': other_booking.id})
        with self.assertRaises(HTTPUnauthorized) as cm:
            get_booking(request)
        self.assertIn('You do not have permission', cm.exception.json_body['error'])

    def test_update_booking_status_client_cancel_success(self):
        # Create a pending booking for client to cancel
        pending_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 12, 28), time_slot=time(10,0), is_booked=True)
        self.session.add(pending_schedule)
        pending_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=pending_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(pending_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': pending_booking.id}, json_body={
            'status': 'rejected'
        })
        response = update_booking_status(request)
        self.assertEqual(response['status'], 'rejected')
        self.assertFalse(self.session.get(Schedule, pending_schedule.id).is_booked)

    def test_update_booking_status_client_invalid_status(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.booking_client_confirmed.id}, json_body={
            'status': 'confirmed' # Client cannot set to confirmed
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Clients can only cancel their bookings', cm.exception.json_body['error'])

    def test_update_booking_status_client_cancel_non_pending_fails(self):
        # Client tries to cancel an already confirmed booking
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': self.booking_client_confirmed.id}, json_body={
            'status': 'rejected'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Only pending bookings can be cancelled by clients', cm.exception.json_body['error'])


    def test_update_booking_status_psychologist_confirm_success(self):
        # Create a pending booking for psychologist to confirm
        pending_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 12, 29), time_slot=time(10,0), is_booked=True)
        self.session.add(pending_schedule)
        pending_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=pending_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(pending_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': pending_booking.id}, json_body={
            'status': 'confirmed'
        })
        response = update_booking_status(request)
        self.assertEqual(response['status'], 'confirmed')
        self.assertTrue(self.session.get(Schedule, pending_schedule.id).is_booked)

    def test_update_booking_status_psychologist_reject_success(self):
        # Create a pending booking for psychologist to reject
        pending_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 12, 30), time_slot=time(10,0), is_booked=True)
        self.session.add(pending_schedule)
        pending_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=pending_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(pending_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': pending_booking.id}, json_body={
            'status': 'rejected'
        })
        response = update_booking_status(request)
        self.assertEqual(response['status'], 'rejected')
        self.assertFalse(self.session.get(Schedule, pending_schedule.id).is_booked)

    def test_update_booking_status_psychologist_unauthorized_other_psy(self):
        # Create another psychologist
        other_psy = User(id=str(uuid.uuid4()), username="other_psy", email="other_psy@example.com", role="psychologist")
        other_psy.set_password("pass")
        self.session.add(other_psy)
        self.session.flush()

        # Create a schedule for other_psy
        other_psy_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=other_psy.id, date=date(2026, 1, 1), time_slot=time(9,0), is_booked=True)
        self.session.add(other_psy_schedule)
        other_psy_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=other_psy_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(other_psy_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': other_psy_booking.id}, json_body={
            'status': 'confirmed'
        })
        with self.assertRaises(HTTPUnauthorized) as cm:
            update_booking_status(request)
        self.assertIn('You do not have permission', cm.exception.json_body['error'])

    def test_update_booking_status_psychologist_invalid_status(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.booking_client_confirmed.id}, json_body={
            'status': 'invalid_status'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Invalid status provided', cm.exception.json_body['error'])

    def test_update_booking_status_psychologist_revert_confirmed_fails(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.booking_client_confirmed.id}, json_body={
            'status': 'pending'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Cannot change confirmed booking back to pending', cm.exception.json_body['error'])

    def test_update_booking_status_psychologist_change_rejected_fails(self):
        # Create a rejected booking
        rejected_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2026, 1, 2), time_slot=time(9,0), is_booked=False)
        self.session.add(rejected_schedule)
        rejected_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=rejected_schedule.id, status="rejected", created_at=datetime.utcnow())
        self.session.add(rejected_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': rejected_booking.id}, json_body={
            'status': 'confirmed'
        })
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Cannot change rejected booking status', cm.exception.json_body['error'])

    def test_update_booking_status_missing_status(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.booking_client_confirmed.id}, json_body={})
        with self.assertRaises(HTTPBadRequest) as cm:
            update_booking_status(request)
        self.assertIn('Status field is required', cm.exception.json_body['error'])

    def test_delete_booking_client_success(self):
        # Create a pending booking for client to delete
        pending_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 12, 31), time_slot=time(10,0), is_booked=True)
        self.session.add(pending_schedule)
        pending_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=pending_schedule.id, status="pending", created_at=datetime.utcnow())
        self.session.add(pending_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.client_user.id, matchdict={'id': pending_booking.id})
        response = delete_booking(request)
        self.assertEqual(response['message'], 'Booking deleted successfully')
        self.assertIsNone(self.session.get(Booking, pending_booking.id))
        self.assertFalse(self.session.get(Schedule, pending_schedule.id).is_booked)

    def test_delete_booking_psychologist_success(self):
        request = dummy_request(self.session, authenticated_userid=self.psychologist_user.id, matchdict={'id': self.booking_client_confirmed.id})
        response = delete_booking(request)
        self.assertEqual(response['message'], 'Booking deleted successfully')
        self.assertIsNone(self.session.get(Booking, self.booking_client_confirmed.id))
        self.assertFalse(self.session.get(Schedule, self.schedule_psy_booked.id).is_booked) # Schedule should be unbooked


class TestReviewViews(BaseTest):
    """Tests for review views."""

    def test_create_review_success(self):
        # Create a new booking that can be reviewed
        reviewable_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 11, 1), time_slot=time(9,0), is_booked=True)
        self.session.add(reviewable_schedule)
        reviewable_booking = Booking(id=str(uuid.uuid4()), client_id=self.client_user.id, schedule_id=reviewable_schedule.id, status="confirmed", created_at=datetime.utcnow())
        self.session.add(reviewable_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'booking_id': reviewable_booking.id,
            'rating': 4,
            'comment': 'Good session, helpful advice.'
        })
        response = create_review(request)
        self.assertIn('id', response)
        self.assertEqual(response['booking_id'], reviewable_booking.id)
        self.assertEqual(response['rating'], 4)
        self.assertEqual(response['comment'], 'Good session, helpful advice.')

    def test_create_review_booking_not_found(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'booking_id': 'nonexistent_booking',
            'rating': 5,
            'comment': 'Test'
        })
        with self.assertRaises(HTTPNotFound):
            create_review(request)

    def test_create_review_not_own_booking(self):
        # Create another client and their booking
        other_client = User(id=str(uuid.uuid4()), username="other_client_for_review", email="other_review@example.com", role="client")
        other_client.set_password("pass")
        self.session.add(other_client)
        other_schedule = Schedule(id=str(uuid.uuid4()), psychologist_id=self.psychologist_user.id, date=date(2025, 11, 2), time_slot=time(9,0), is_booked=True)
        self.session.add(other_schedule)
        other_booking = Booking(id=str(uuid.uuid4()), client_id=other_client.id, schedule_id=other_schedule.id, status="confirmed", created_at=datetime.utcnow())
        self.session.add(other_booking)
        self.session.flush()

        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'booking_id': other_booking.id,
            'rating': 3,
            'comment': 'Should not be able to review this.'
        })
        with self.assertRaises(HTTPNotFound) as cm:
            create_review(request)
        self.assertIn('Booking not found or not yours', cm.exception.json_body['error'])

    def test_create_review_missing_rating(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'booking_id': self.booking_client_confirmed.id,
            'comment': 'Missing rating.'
        })
        with self.assertRaises(IntegrityError): # rating is non-nullable
            create_review(request)

    def test_create_review_missing_booking_id(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id, json_body={
            'rating': 5,
            'comment': 'Missing booking ID.'
        })
        with self.assertRaises(IntegrityError): # booking_id is non-nullable
            create_review(request)

    def test_list_reviews_success(self):
        request = dummy_request(self.session, authenticated_userid=self.client_user.id)
        response = list_reviews(request)
        self.assertEqual(len(response), 1)
        self.assertEqual(response[0]['id'], self.review_client.id)


class TestPsychologistViews(BaseTest):
    """Tests for psychologist views."""

    def test_get_psychologists_with_available_schedules_success(self):
        request = dummy_request(self.session)
        response = get_psychologists_with_available_schedules(request)
        self.assertEqual(len(response), 1) # Only one psychologist with available schedule
        self.assertEqual(response[0]['id'], self.psychologist_user.id)
        self.assertGreater(len(response[0]['available_schedules']), 0)
        self.assertTrue(all(not s['is_booked'] for s in response[0]['available_schedules']))

    def test_get_psychologists_with_no_available_schedules(self):
        # Book all schedules for the psychologist
        self.schedule_psy_available.is_booked = True
        self.session.flush()

        request = dummy_request(self.session)
        response = get_psychologists_with_available_schedules(request)
        self.assertEqual(len(response), 0) # No psychologists should be returned if no available schedules

    def test_get_psychologist_detail_success(self):
        request = dummy_request(self.session, matchdict={'id': self.psychologist_user.id})
        response = get_psychologist_detail(request)
        self.assertEqual(response['id'], self.psychologist_user.id)
        self.assertEqual(response['username'], self.psychologist_user.username)
        self.assertIn('available_schedules', response)
        self.assertGreater(len(response['available_schedules']), 0)
        self.assertIn('reviews', response)
        self.assertEqual(len(response['reviews']), 1)
        self.assertEqual(response['average_rating'], 5.0)
        self.assertEqual(response['total_reviews'], 1)

    def test_get_psychologist_detail_not_found(self):
        request = dummy_request(self.session, matchdict={'id': 'nonexistent_psy'})
        with self.assertRaises(HTTPNotFound):
            get_psychologist_detail(request)

    def test_get_psychologist_detail_no_reviews(self):
        # Create a new psychologist with no reviews
        psy_no_reviews = User(id=str(uuid.uuid4()), username="psy_no_reviews", email="no_reviews@example.com", role="psychologist")
        psy_no_reviews.set_password("pass")
        self.session.add(psy_no_reviews)
        self.session.flush()

        request = dummy_request(self.session, matchdict={'id': psy_no_reviews.id})
        response = get_psychologist_detail(request)
        self.assertEqual(response['id'], psy_no_reviews.id)
        self.assertEqual(response['total_reviews'], 0)
        self.assertIsNone(response['average_rating'])
        self.assertEqual(len(response['reviews']), 0)
