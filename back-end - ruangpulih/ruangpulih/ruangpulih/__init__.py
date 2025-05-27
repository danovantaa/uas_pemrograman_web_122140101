from pyramid.config import Configurator
from pyramid.authentication import AuthTktAuthenticationPolicy
from pyramid.authorization import ACLAuthorizationPolicy
from .cors import cors_tween_factory
from pyramid.renderers import JSON


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application. """
    # Set authentication and authorization policies
    authn_policy = AuthTktAuthenticationPolicy(
        secret='supersecretvalue',  # Ganti dengan nilai rahasia Anda
        callback=None,  # Tidak ada callback untuk group/role karena Anda tidak memakai role
        hashalg='sha512'
    )
    
    authz_policy = ACLAuthorizationPolicy()  # Untuk authorization dasar

    with Configurator(settings=settings) as config:
        config.set_authentication_policy(authn_policy)  # Set authentication policy
        config.set_authorization_policy(authz_policy)  # Set authorization policy
        
        config.add_tween('.cors_tween_factory')  # Add CORS tween
        config.add_renderer('json', JSON(indent=4))

        config.include('pyramid_jinja2')
        config.include('.models')
        config.include('.routes')
    
        config.scan()  # Memindai semua view-config

    return config.make_wsgi_app()
