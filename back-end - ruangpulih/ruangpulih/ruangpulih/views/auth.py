from pyramid.view import view_config
from pyramid.response import Response
from pyramid.httpexceptions import HTTPBadRequest, HTTPConflict, HTTPUnauthorized
from pyramid.security import remember, forget
from ..models.user import User
from uuid import uuid4

def require_fields(data, required_fields):
    """Helper function to validate required fields in request data."""
    missing = [f for f in required_fields if not data.get(f)]
    if missing:
        raise HTTPBadRequest(json_body={'error': f'Missing fields: {", ".join(missing)}'})

@view_config(route_name='register', request_method='POST', renderer='json')
def register(request):
    """Handles new user registration."""
    data = request.json_body

    try:
        require_fields(data, ['username', 'email', 'password', 'role'])
    except HTTPBadRequest as e:
        return e

    username = data['username']
    email = data['email']
    password = data['password']
    role_str = data['role']

    valid_roles = ["client", "psychologist"]
    if role_str not in valid_roles:
        return HTTPBadRequest(json_body={'error': f'Invalid role: {role_str}. Valid roles are: {", ".join(valid_roles)}'})

    if request.dbsession.query(User).filter_by(username=username).first():
        return HTTPConflict(json_body={'error': 'Username already exists'})
    if request.dbsession.query(User).filter_by(email=email).first():
        return HTTPConflict(json_body={'error': 'Email already exists'})

    new_user = User(
        id=str(uuid4()),
        username=username,
        email=email,
        role=role_str
    )
    
    new_user.set_password(password)
    request.dbsession.add(new_user)

    return {
        'message': 'Registration successful',
        'user': new_user.to_dict()
    }

@view_config(route_name='login', request_method='POST', renderer='json')
def login(request):
    """Handles user login."""
    data = request.json_body

    try:
        require_fields(data, ['email', 'password'])
    except HTTPBadRequest as e:
        return e

    email = data['email']
    password = data['password']
    user = request.dbsession.query(User).filter_by(email=email).first()

    if not user or not user.check_password(password):
        return HTTPUnauthorized(json_body={'error': 'Invalid credentials'})

    headers = remember(request, user.id)

    return Response(
        json_body={
            'message': 'Login successful',
            'user': user.to_dict()
        },
        headers=headers,
        content_type='application/json'
    )

@view_config(route_name='logout', request_method='POST', renderer='json')
def logout(request):
    """Handles user logout."""
    headers = forget(request)
    return Response(
        json_body={'message': 'Logout successful'},
        headers=headers,
        content_type='application/json'
    )
