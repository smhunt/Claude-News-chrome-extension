# Claude Code Digest - Chrome Extension

A Chrome extension that displays your daily Claude Code digest with inline YouTube video players and text-to-speech audio features.

## Features

- 📰 **Daily Digest Display** - Curated Claude Code content including tutorials, best practices, and workflow guides
- 🎬 **Inline YouTube Players** - Watch tutorial videos directly within the extension popup
- 🔊 **Text-to-Speech** - Listen to digest content using the Web Speech API
- ⭐ **Star Items** - Save your favorite items for quick reference
- 📋 **Copy Summary** - Copy the entire digest as formatted markdown
- ⚙️ **Settings Panel** - Customize speech speed and theme preferences

## Quick Start

1. Clone or download this repository
2. Open `chrome://extensions` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" and select this folder
5. Click the extension icon in your toolbar

## Documentation

See [INSTRUCTIONS.md](INSTRUCTIONS.md) for comprehensive usage instructions, customization options, and troubleshooting tips.

## Tech Stack

- **Manifest V3** - Latest Chrome extension format
- **Pure HTML/CSS/JS** - No frameworks required
- **Web Speech API** - Browser-native text-to-speech
- **Chrome Storage API** - Persistent user data
- **YouTube IFrame API** - Embedded video players

## File Structure

```
├── manifest.json      # Extension manifest
├── popup.html         # Popup UI
├── popup.css          # Styles
├── popup.js           # Core logic
├── icons/             # Extension icons
├── INSTRUCTIONS.md    # Detailed documentation
└── README.md          # This file
```

## License

Open source - feel free to use and modify.