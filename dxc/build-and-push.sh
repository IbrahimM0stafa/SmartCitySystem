#!/bin/bash

# Usage: ./build-and-push.sh v1.0.0

# Check if a version tag is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide a version tag (e.g., v1.0.0)"
  echo "Usage: ./build-and-push.sh v1.0.0"
  exit 1
fi

VERSION_TAG="$1"

# Image names
BACKEND_IMAGE="ibrahimtalaat/dxc-backend"
FRONTEND_IMAGE="ibrahimtalaat/dxc-frontend"

echo "🔧 Building and pushing backend image..."
docker build -t $BACKEND_IMAGE:latest -t $BACKEND_IMAGE:$VERSION_TAG .
docker push $BACKEND_IMAGE:latest
docker push $BACKEND_IMAGE:$VERSION_TAG
echo "✅ Backend images pushed: latest, $VERSION_TAG"

echo "🔧 Building and pushing frontend image..."
docker build -t $FRONTEND_IMAGE:latest -t $FRONTEND_IMAGE:$VERSION_TAG ../frontend
docker push $FRONTEND_IMAGE:latest
docker push $FRONTEND_IMAGE:$VERSION_TAG
echo "✅ Frontend images pushed: latest, $VERSION_TAG"
