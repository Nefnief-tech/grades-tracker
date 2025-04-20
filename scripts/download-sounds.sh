#!/bin/bash

echo "Downloading sound files for Pomodoro timer..."

# Create sounds directory if it doesn't exist
mkdir -p public/sounds

# Download bell sound
echo "Downloading bell sound..."
curl -L -o public/sounds/bell.mp3 https://cdn.freesound.org/previews/80/80921_1022651-lq.mp3 || \
curl -L -o public/sounds/bell.mp3 https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=bell-sound-36792.mp3

# Download tick sound
echo "Downloading tick sound..."
curl -L -o public/sounds/tick.mp3 https://cdn.freesound.org/previews/339/339912_5121236-lq.mp3 || \
curl -L -o public/sounds/tick.mp3 https://cdn.pixabay.com/download/audio/2022/08/04/audio_fb3a2a1062.mp3?filename=clock-tick-1-46053.mp3

echo "Sound files downloaded successfully!"
