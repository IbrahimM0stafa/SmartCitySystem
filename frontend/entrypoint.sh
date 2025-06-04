#!/bin/sh

if [ -z "$MINIKUBE_IP" ]; then
  echo "MINIKUBE_IP is not set. Using fallback: http://localhost:8081"
  MINIKUBE_IP="localhost:8081"
else
  MINIKUBE_IP="$MINIKUBE_IP:31881"
fi

export BACKEND_URL="http://$MINIKUBE_IP"

echo "Using BACKEND_URL: $BACKEND_URL"

envsubst < /usr/share/nginx/html/assets/config/app.config.json > /tmp/app.config.json
mv /tmp/app.config.json /usr/share/nginx/html/assets/config/app.config.json

cat /usr/share/nginx/html/assets/config/app.config.json

exec "$@"
