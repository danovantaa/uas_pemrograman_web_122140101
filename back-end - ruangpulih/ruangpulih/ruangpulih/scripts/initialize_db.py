import os
import argparse
import sys
import transaction
import uuid
from datetime import datetime, date, time

from pyramid.paster import bootstrap, setup_logging
from sqlalchemy.exc import OperationalError

from .. import models
from ..models.meta import Base
from ..models.user import User
from ..models.schedule import Schedule
from ..models.booking import Booking
from ..models.review import Review

def setup_models(dbsession):
    """
    Initializes database tables and adds dummy data.
    """
    print("Creating all tables based on models...")
    Base.metadata.create_all(dbsession.bind)
    print("Tables successfully created.")

    print("Adding dummy data...")

    # 1. Users (Psychologists and Clients)
    psychologist_lisa = User(
        id=str(uuid.uuid4()),
        username="dr.lisa",
        email="lisa@ruangpulih.com",
        role="psychologist"
    )
    psychologist_lisa.set_password("passwordlisa")
    dbsession.add(psychologist_lisa)

    psychologist_budi = User(
        id=str(uuid.uuid4()),
        username="dr.budi",
        email="budi@ruangpulih.com",
        role="psychologist"
    )
    psychologist_budi.set_password("passwordbudi")
    dbsession.add(psychologist_budi)

    client_ali = User(
        id=str(uuid.uuid4()),
        username="ali_client",
        email="ali@example.com",
        role="client"
    )
    client_ali.set_password("passwordali")
    dbsession.add(client_ali)

    client_bina = User(
        id=str(uuid.uuid4()),
        username="bina_client",
        email="bina@example.com",
        role="client"
    )
    client_bina.set_password("passwordbina")
    dbsession.add(client_bina)

    dbsession.flush()

    # 2. Schedules
    schedule_lisa_1 = Schedule(
        id=str(uuid.uuid4()),
        psychologist_id=psychologist_lisa.id,
        date=date(2025, 6, 1),
        time_slot=time(9, 0),
        is_booked=False
    )
    dbsession.add(schedule_lisa_1)

    schedule_lisa_2 = Schedule(
        id=str(uuid.uuid4()),
        psychologist_id=psychologist_lisa.id,
        date=date(2025, 6, 1),
        time_slot=time(10, 0),
        is_booked=False
    )
    dbsession.add(schedule_lisa_2)

    schedule_budi_1 = Schedule(
        id=str(uuid.uuid4()),
        psychologist_id=psychologist_budi.id,
        date=date(2025, 6, 2),
        time_slot=time(14, 0),
        is_booked=False
    )
    dbsession.add(schedule_budi_1)

    schedule_budi_2 = Schedule(
        id=str(uuid.uuid4()),
        psychologist_id=psychologist_budi.id,
        date=date(2025, 6, 2),
        time_slot=time(15, 0),
        is_booked=False
    )
    dbsession.add(schedule_budi_2)

    dbsession.flush()

    # 3. Bookings
    booking_ali_lisa = Booking(
        id=str(uuid.uuid4()),
        client_id=client_ali.id,
        schedule_id=schedule_lisa_1.id,
        status="confirmed",
        created_at=datetime.utcnow()
    )
    dbsession.add(booking_ali_lisa)
    schedule_lisa_1.is_booked = True

    booking_bina_budi = Booking(
        id=str(uuid.uuid4()),
        client_id=client_bina.id,
        schedule_id=schedule_budi_1.id,
        status="pending",
        created_at=datetime.utcnow()
    )
    dbsession.add(booking_bina_budi)
    schedule_budi_1.is_booked = True

    dbsession.flush()

    # 4. Reviews
    review_ali = Review(
        id=str(uuid.uuid4()),
        booking_id=booking_ali_lisa.id,
        rating=5,
        comment="Sesi yang sangat membantu dan insightful. Terima kasih dr. Lisa!"
    )
    dbsession.add(review_ali)

    print("Dummy data successfully added.")


def parse_args(argv):
    parser = argparse.ArgumentParser()
    parser.add_argument(
        'config_uri',
        help='Configuration file, e.g., development.ini',
    )
    return parser.parse_args(argv[1:])


def main(argv=sys.argv):
    args = parse_args(argv)
    setup_logging(args.config_uri)
    env = bootstrap(args.config_uri)

    try:
        with env['request'].tm:
            dbsession = env['request'].dbsession
            setup_models(dbsession)
            transaction.commit()
            print("Database initialization complete.")
    except OperationalError:
        print('''
Pyramid is having a problem using your SQL database. The problem
might be caused by one of the following things:

1.  You may need to initialize your database tables with `alembic upgrade head`.
    This script (`initialize_db.py`) is for initial data population
    after the schema is created by Alembic.

2.  Your database server may not be running. Check that the
    database server referred to by the "sqlalchemy.url" setting in
    your "development.ini" file is running.
        ''')
        sys.exit(1)
    except Exception as e:
        print(f"An error occurred during database initialization: {e}")
        transaction.abort()
        sys.exit(1)
