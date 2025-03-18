#!/bin/bash
# Script to publish your Grades app to Docker Hub

# Variables - replace with your Docker Hub username
DOCKER_HUB_USERNAME="your-username"
IMAGE_NAME="grades-app"
VERSION="1.0.0"
TAG="${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
LATEST_TAG="${DOCKER_HUB_USERNAME}/${IMAGE_NAME}:latest"

# Step 1: Ensure we're logged in to Docker Hub
echo "Checking Docker Hub login status..."
docker login

# Step 2: Tag local image for Docker Hub
echo "Tagging local image as ${TAG}..."
docker tag ${IMAGE_NAME}:latest ${TAG}
docker tag ${IMAGE_NAME}:latest ${LATEST_TAG}

# Step 3: Push image to Docker Hub
echo "Pushing image to Docker Hub..."
docker push ${TAG}
docker push ${LATEST_TAG}

echo "Image published successfully to Docker Hub as ${TAG} and ${LATEST_TAG}"
echo "View your image at: https://hub.docker.com/r/${DOCKER_HUB_USERNAME}/${IMAGE_NAME}"
