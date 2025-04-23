#!/bin/bash

# Set variables
IMAGE_NAME="smartcity-angular"
DOCKER_USER="your_dockerhub_username"  # Change this if pushing to Docker Hub
TAG="v1.0.0"
FULL_IMAGE_NAME="$DOCKER_USER/$IMAGE_NAME:$TAG"
PORT=4200
CONTAINER_NAME="smartcity-container"

# Step 1: Build the Docker image
echo "🔨 Building Docker image..."
docker build -t $IMAGE_NAME .

# Step 2: Tag the image
echo "🏷️ Tagging image as $FULL_IMAGE_NAME..."
docker tag $IMAGE_NAME $FULL_IMAGE_NAME

# Step 3: Push to Docker Hub (optional)
echo "📤 Pushing $FULL_IMAGE_NAME to Docker Hub..."
docker push $FULL_IMAGE_NAME

# Step 4: Stop and remove existing container (if any)
if [ "$(docker ps -aq -f name=$CONTAINER_NAME)" ]; then
    echo "🛑 Stopping and removing existing container..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Step 5: Run the container on port 4200
echo "🚀 Running Docker container on port $PORT..."
docker run -d -p $PORT:80 --name $CONTAINER_NAME $IMAGE_NAME

echo "🌐 App is running at http://localhost:$PORT"
