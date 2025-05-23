#!/bin/bash

# Backend
BACKEND_IMAGE="youssef773/dxc-backend"
FRONTEND_IMAGE="youssef773/dxc-frontend"
TAG="latest"

echo " Building and pushing backend image..."
docker build -t $BACKEND_IMAGE:$TAG .
docker push $BACKEND_IMAGE:$TAG

echo " Backend image pushed as $BACKEND_IMAGE:$TAG"

echo " Building and pushing frontend image..."
docker build -t $FRONTEND_IMAGE:$TAG ../frontend
docker push $FRONTEND_IMAGE:$TAG

echo " Frontend image pushed as $FRONTEND_IMAGE:$TAG"
