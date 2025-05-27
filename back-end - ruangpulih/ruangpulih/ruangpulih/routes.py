def includeme(config):
    config.add_static_view('static', 'static', cache_max_age=3600)
    config.add_route('home', '/')

    # Auth routes
    config.add_route('register', '/register')
    config.add_route('login', '/login')
    config.add_route('logout', '/logout')

    # Schedules routes
    config.add_route('schedules', '/schedules')                     # GET (list), POST (create)
    config.add_route('schedule_detail', '/schedules/{id}')          # GET (detail), PUT (update), DELETE (delete)

    # Bookings routes
    config.add_route('bookings', '/bookings')
    config.add_route('booking_detail', '/bookings/{id}')

    # Psychologists routes
    config.add_route('psychologists_with_available_schedules', '/psychologists/available')
    config.add_route('psychologist_detail', '/psychologists/{id}')

    # Reviews routes
    config.add_route('reviews', '/reviews')
