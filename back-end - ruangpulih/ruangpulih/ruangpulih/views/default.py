from pyramid.response import Response
from pyramid.view import view_config

@view_config(route_name='home')
def home_view(request): 
    return Response('Ruang Pulih API Home', content_type='text/plain')
