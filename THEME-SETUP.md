# Theme System Setup

This document provides instructions for setting up the new theme customization system in Grade Tracker.

## Required Dependencies

The theme system requires the following dependencies:

- `zustand`: For persistent state management
- `react-colorful`: For color pickers

## Installation

Run the following command to install the required dependencies:

```bash
npm install zustand react-colorful
# or
yarn add zustand react-colorful
# or
pnpm add zustand react-colorful
```

## Theme Features

The new theme system provides:

- Multiple preset themes (Default, Wiki, Minimal, Neumorphic, Glassmorphic, Dark, Light)
- Color scheme selection with 10 color options
- Border radius customization
- Font family selection
- Animation toggle
- Custom color editor

## Usage

1. Navigate to Profile > Settings
2. Select the "Theme" tab
3. Customize your theme preferences
4. Click "Save Theme" to apply changes

## Implementation Details

- Theme settings are persisted using Zustand store with localStorage
- The ThemeProvider component applies CSS variables to the `:root` element
- Font families are loaded dynamically based on selection
- Theme transitions are applied when enabled