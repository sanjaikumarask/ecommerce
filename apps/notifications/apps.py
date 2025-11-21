from django.apps import AppConfig

class NotificationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.notifications'

    def ready(self):
        # Import consumers here to avoid import errors during startup/migrations
        try:
            from . import consumers
        except ImportError as e:
            # Log the error, but don't stop Django startup
            import logging
            logging.warning(f"Could not import notifications consumers: {e}")
