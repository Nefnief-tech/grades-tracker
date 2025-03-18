@echo off
REM Script to publish your Grades app to Docker Hub

REM Variables - replace with your Docker Hub username
set DOCKER_HUB_USERNAME=nefnief1
set IMAGE_NAME=grades-app
set VERSION=1.0.0
set TAG=%DOCKER_HUB_USERNAME%/%IMAGE_NAME%:%VERSION%
set LATEST_TAG=%DOCKER_HUB_USERNAME%/%IMAGE_NAME%:latest

REM Step 1: Ensure we're logged in to Docker Hub
echo Checking Docker Hub login status...
docker login

REM Step 2: Tag local image for Docker Hub
echo Tagging local image as %TAG%...
docker tag %IMAGE_NAME%:latest %TAG%
docker tag %IMAGE_NAME%:latest %LATEST_TAG%

REM Step 3: Push image to Docker Hub
echo Pushing image to Docker Hub...
docker push %TAG%
docker push %LATEST_TAG%

echo Image published successfully to Docker Hub as %TAG% and %LATEST_TAG%
echo View your image at: https://hub.docker.com/r/%DOCKER_HUB_USERNAME%/%IMAGE_NAME%
pause
