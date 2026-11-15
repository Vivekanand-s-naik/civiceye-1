"""
API Routes Package

Exports all API routers.
"""

from app.api import auth_routes, citizen_routes, authority_routes, admin_routes, ml_routes

__all__ = [
    "auth_routes",
    "citizen_routes",
    "authority_routes",
    "admin_routes",
    "ml_routes",
]
