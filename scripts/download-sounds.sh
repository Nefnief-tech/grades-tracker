#!/bin/bash

# Create the sounds directory if it doesn't exist
mkdir -p public/sounds

# URLs for free sounds (replace with actual URLs)
BELL_SOUND_URL="https://freesound.org/data/previews/484/484344_9509443-lq.mp3"
TICK_SOUND_URL="https://freesound.org/data/previews/254/254316_4062622-lq.mp3"

# Download the sounds
echo "Downloading bell sound..."
curl -L "$BELL_SOUND_URL" -o public/sounds/bell.mp3
echo "Downloading tick sound..."
curl -L "$TICK_SOUND_URL" -o public/sounds/tick.mp3

echo "Sound files downloaded successfully!"
