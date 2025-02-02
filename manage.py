#!/usr/bin/env python
import os
import sys

# import dotenv

if __name__ == "__main__":
    # not sure we need this
    # it is better to use external tools to set ENV variables
    # TODO remove
    # dotenv.read_dotenv()
    if sys.argv[1] == 'test':
        os.environ['DJANGO_SETTINGS_MODULE'] = 'settings.test_settings'
    else:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'settings.production_settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError:
        # The above import may fail for some other reason. Ensure that the
        # issue is really that Django is missing to avoid masking other
        # exceptions on Python 2.
        try:
            import django
        except ImportError:
            raise ImportError(
                "Couldn't import Django. Are you sure it's installed and "
                "available on your PYTHONPATH environment variable? Did you "
                "forget to activate a virtual environment?"
            )
        raise
    execute_from_command_line(sys.argv)
