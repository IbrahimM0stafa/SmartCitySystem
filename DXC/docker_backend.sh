#!/bin/bash

# Variables
IMAGE_NAME="youssef773/dxc-backend"
TAG="latest" # or use `git rev-parse --short HEAD` for commit-based tag

# Build the Docker image
echo "Building Docker image..."
docker build -t $IMAGE_NAME:$TAG .

# Tag the image
echo " Tagging Docker image..."
docker tag $IMAGE_NAME:$TAG $IMAGE_NAME:$TAG

# Push to Docker Hub
echo "Pushing Docker image to Docker Hub..."
docker push $IMAGE_NAME:$TAG

echo "Done. Image pushed as $IMAGE_NAME:$TAG"
