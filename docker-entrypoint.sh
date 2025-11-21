#!/bin/sh
set -e

############################################
# Read mode passed from docker-compose
############################################
MODE="$1"
shift || true   # shift remaining args so "$@" only contains extra args

# Debug
echo "[entrypoint] MODE = $MODE"

############################################
# Required environment variables
############################################
: "${POSTGRES_DB:?POSTGRES_DB not set}"
: "${POSTGRES_USER:?POSTGRES_USER not set}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD not set}"
: "${POSTGRES_HOST:?POSTGRES_HOST not set}"

REDIS_HOST=${REDIS_HOST:-redis}
KAFKA_HOST=${KAFKA_HOST:-kafka}
KAFKA_PORT=${KAFKA_PORT:-9092}

export DJANGO_SETTINGS_MODULE=${DJANGO_SETTINGS_MODULE:-core.settings}

############################################
# Wait for Postgres
############################################
echo "[entrypoint] Waiting for Postgres..."
until PGPASSWORD=$POSTGRES_PASSWORD \
      psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\q' >/dev/null 2>&1; do
  sleep 1
done
echo "[entrypoint] Postgres ready."

############################################
# Wait for Redis
############################################
echo "[entrypoint] Waiting for Redis..."
until redis-cli -h "$REDIS_HOST" ping >/dev/null 2>&1; do
  sleep 1
done
echo "[entrypoint] Redis ready."

############################################
# Wait for Kafka (optional, non-blocking if kafka not used)
############################################
echo "[entrypoint] Waiting for Kafka..."
# use nc if present; if not, try tcp check via bash (best-effort)
if command -v nc >/dev/null 2>&1; then
  until nc -z "$KAFKA_HOST" "$KAFKA_PORT"; do
      echo "Kafka not ready, retrying..."
      sleep 2
  done
else
  # fallback: try connecting with /usr/bin/kafka-broker-api-versions (if available) once
  if command -v /usr/bin/kafka-broker-api-versions >/dev/null 2>&1; then
    until /usr/bin/kafka-broker-api-versions --bootstrap-server "$KAFKA_HOST:$KAFKA_PORT" >/dev/null 2>&1; do
      echo "Kafka not ready, retrying..."
      sleep 2
    done
  else
    # no nc and no kafka tool — print a message and continue (workers will retry internally)
    echo "[entrypoint] Warning: no nc or kafka client available in image; skipping active Kafka wait"
  fi
fi
echo "[entrypoint] Kafka ready."

############################################
# Execute selected mode
############################################
case "$MODE" in

  web)
    echo "[entrypoint] Running migrations..."
    python manage.py migrate --noinput

    echo "[entrypoint] Collecting static files..."
    python manage.py collectstatic --noinput

    if [ -n "$DJANGO_SUPERUSER_USERNAME" ] \
       && [ -n "$DJANGO_SUPERUSER_EMAIL" ] \
       && [ -n "$DJANGO_SUPERUSER_PASSWORD" ]; then
      echo "[entrypoint] Ensuring superuser exists..."
      python - <<PYCODE
import os, django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", os.environ.get("DJANGO_SETTINGS_MODULE", "core.settings"))
django.setup()
from django.contrib.auth import get_user_model
User = get_user_model()
u = os.environ["DJANGO_SUPUSER_USERNAME"] if "DJANGO_SUPUSER_USERNAME" in os.environ else os.environ.get("DJANGO_SUPERUSER_USERNAME")
# fallback above fixes typo or env differences
u = os.environ.get("DJANGO_SUPERUSER_USERNAME")
e = os.environ.get("DJANGO_SUPERUSER_EMAIL")
p = os.environ.get("DJANGO_SUPERUSER_PASSWORD")
if u and not User.objects.filter(username=u).exists():
    User.objects.create_superuser(username=u, email=e, password=p)
PYCODE
    fi

    echo "[entrypoint] Starting Daphne ASGI server..."
    # Use daphne to serve ASGI (websockets + http)
    exec daphne -b 0.0.0.0 -p 8000 core.asgi:application
    ;;

  worker)
    echo "[entrypoint] Starting Celery worker..."
    exec celery -A core worker --loglevel=info "$@"
    ;;

  beat)
    echo "[entrypoint] Starting Celery beat..."
    exec celery -A core beat --loglevel=info \
      --pidfile=/app/celery-data/celerybeat.pid "$@"
    ;;

  orders_worker)
    echo "[entrypoint] Starting Orders Kafka Worker..."
    exec python manage.py orders_worker
    ;;

  payment_worker)
    echo "[entrypoint] Starting Payments Kafka Worker..."
    exec python manage.py payment_worker
    ;;

  billing_worker)
    echo "[entrypoint] Starting Billing Kafka Worker..."
    exec python manage.py billing_worker
    ;;

  notifications_worker)
    echo "[entrypoint] Starting Notifications Kafka Worker..."
    exec python manage.py notifications_worker
    ;;

  *)
    echo "[entrypoint] Invalid mode: $MODE"
    echo "Valid: web | worker | beat | orders_worker | payment_worker | billing_worker | notifications_worker"
    exit 1
    ;;
esac
