# Setting Up Sound Files for the Pomodoro Timer

The Pomodoro timer requires two sound files to function properly:

## Required Files

1. `bell.mp3` - Plays when a timer session ends
2. `tick.mp3` - Plays periodically during active timer sessions

## How to Set Up

### Option 1: Download Free Sound Files

You can download free sound files from various websites:

#### For bell.mp3:

- [Pixabay Bell Sounds](https://pixabay.com/sound-effects/search/bell/)
- [Mixkit Bell Sounds](https://mixkit.co/free-sound-effects/bell/)

#### For tick.mp3:

- [Pixabay Tick Sounds](https://pixabay.com/sound-effects/search/tick/)
- [Mixkit Clock Sounds](https://mixkit.co/free-sound-effects/clock/)

Download the files, rename them to `bell.mp3` and `tick.mp3`, and place them in this directory.

### Option 2: Use the Audio Files from a Command Line

If you have curl installed, you can run these commands from your project root:

```bash
# Download bell sound
curl -o public/sounds/bell.mp3 https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=bell-sound-36792.mp3

# Download tick sound
curl -o public/sounds/tick.mp3 https://cdn.pixabay.com/download/audio/2022/08/04/audio_fb3a2a1062.mp3?filename=clock-tick-1-46053.mp3
```

## Important Notes

- Make sure the files are named exactly `bell.mp3` and `tick.mp3`
- Keep the files small (under 100KB each) for better performance
- The current placeholder files need to be replaced with actual MP3 files
