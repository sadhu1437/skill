"""
Custom permission classes for SkillBloom
"""

import logging

from rest_framework import permissions

logger = logging.getLogger("django.security")


class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Permission class that allows:
    - Any authenticated user to read
    - Only admin users to modify
    """
    
    def has_permission(self, request, view):
        # Allow GET requests for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Require authentication for modifications
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)
    
    def has_object_permission(self, request, view, obj):
        # Allow GET requests for everyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Only admin users can modify
        return bool(request.user and request.user.is_staff)


class IsAuthorOrAdmin(permissions.BasePermission):
    """
    Permission class that allows:
    - Authors to edit/delete their own objects
    - Admin users to edit/delete any object
    - Everyone to read
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions allowed for anyone
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Check if user is authenticated
        if not request.user or not request.user.is_authenticated:
            logger.warning(f"Unauthorized attempt to modify {type(obj).__name__}")
            return False
        
        # Admin can modify anything
        if request.user.is_staff:
            logger.info(f"Admin {request.user.username} modifying {type(obj).__name__}")
            return True
        
        # Authors can modify their own objects
        if hasattr(obj, "author"):
            is_author = obj.author == request.user
            if not is_author:
                logger.warning(f"User {request.user.username} attempted to modify {type(obj).__name__} by {obj.author.username}")
            return is_author
        
        if hasattr(obj, "user"):
            is_owner = obj.user == request.user
            if not is_owner:
                logger.warning(f"User {request.user.username} attempted to modify {type(obj).__name__} by {obj.user.username}")
            return is_owner
        
        return False


class IsStaffUser(permissions.BasePermission):
    """
    Permission class that only allows staff users.
    """
    
    message = "Only staff users can access this endpoint."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            logger.warning(f"Unauthenticated attempt to access staff endpoint")
            return False
        
        is_staff = bool(request.user.is_staff)
        if not is_staff:
            logger.warning(f"Non-staff user {request.user.username} attempted to access staff endpoint")
        
        return is_staff


class IsAdminUser(permissions.BasePermission):
    """
    Enhanced version of DRF's IsAdminUser with logging.
    Allows only superusers or staff users.
    """
    
    message = "Only admin users can access this endpoint."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            logger.warning(f"Unauthenticated attempt to access admin endpoint")
            return False
        
        is_admin = bool(request.user.is_superuser or request.user.is_staff)
        if not is_admin:
            logger.warning(f"Non-admin user {request.user.username} attempted to access admin endpoint {request.path}")
        else:
            logger.info(f"Admin {request.user.username} accessing admin endpoint {request.path}")
        
        return is_admin


class RateLimitAuthentication(permissions.BasePermission):
    """
    Permission class for rate-limited authentication endpoints.
    
    This is used to track failed login attempts.
    """
    
    def has_permission(self, request, view):
        # This is always True - actual rate limiting is handled by throttle_classes
        return True
