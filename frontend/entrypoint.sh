#!/bin/sh

if [ -z "$BACKEND_URL" ]; then
  echo "BACKEND_URL is not set. Using fallback: http://localhost:8081"
  BACKEND_URL="http://localhost:8081"
fi

export BACKEND_URL="$BACKEND_URL"

echo "Using BACKEND_URL: $BACKEND_URL"

envsubst < /usr/share/nginx/html/assets/config/app.config.json > /tmp/app.config.json
mv /tmp/app.config.json /usr/share/nginx/html/assets/config/app.config.json

cat /usr/share/nginx/html/assets/config/app.config.json

exec "$@"
