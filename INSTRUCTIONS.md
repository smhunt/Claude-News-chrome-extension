# Claude Code Digest - Chrome Extension

A Chrome extension that displays your daily Claude Code digest with inline YouTube video players and text-to-speech audio features.

## Features

- **📰 Daily Digest Display**: View curated Claude Code content including tutorials, best practices, and workflow guides
- **🎬 Inline YouTube Players**: Watch tutorial videos directly within the extension popup
- **🔊 Text-to-Speech**: Listen to digest content using the Web Speech API
- **⭐ Star Items**: Save your favorite items for quick reference
- **📋 Copy Summary**: Copy the entire digest as formatted markdown
- **⚙️ Settings Panel**: Customize speech speed and theme preferences
- **💾 Persistent Storage**: Your starred items and settings are saved using Chrome's storage API

## Installation

### Method 1: Load as Unpacked Extension (Development)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/your-username/Claude-News-chrome-extension.git
   ```

2. **Open Chrome Extensions Page**
   - Navigate to `chrome://extensions` in your Chrome browser
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the folder containing the extension files (`manifest.json`, `popup.html`, etc.)

5. **Pin the Extension** (Optional)
   - Click the puzzle piece icon in Chrome's toolbar
   - Find "Claude Code Digest" and click the pin icon

### Method 2: Install from Chrome Web Store

*Coming soon - the extension will be available on the Chrome Web Store.*

## Usage

### Viewing the Digest

1. Click the Claude Code Digest icon in your browser toolbar
2. The popup will display the daily digest organized into sections:
   - **Must-Watch Videos**: Tutorial videos with embedded YouTube players
   - **Best-Practice Reading**: Articles and guides
   - **Workflow Deep Dives**: GitHub repos and in-depth resources
   - **Practice Task**: Daily hands-on challenges

### Playing Audio

- **Play All**: Click the "▶ Play All" button to have the entire digest read aloud
- **Play Individual Items**: Click the "🔊 Play" button on any item to hear just that section
- **Pause/Resume**: Use the pause and resume buttons to control playback
- **Stop**: Click "⏹ Stop" to stop audio playback
- **Adjust Speed**: Use the speed dropdown (0.8x, 1.0x, 1.2x, 1.5x) to adjust reading speed

### Watching Videos

- Videos in the "Must-Watch Videos" section have embedded YouTube players
- Click the play button on any video to start watching
- Videos play directly in the extension popup

### Starring Items

- Click the "☆" button on any item to star it
- Starred items show a filled "★" icon
- Your starred items are saved and persist between sessions

### Copying the Summary

- Click "📋 Copy summary" in the footer to copy the entire digest as markdown
- Paste into notes, documents, or share with colleagues

### Settings

1. Click the "⚙️" gear icon in the header
2. Adjust available settings:
   - **Dark theme**: Toggle dark/light theme (dark theme enabled by default)
   - **Default speech speed**: Set your preferred audio playback speed
3. Click "✕" to close the settings panel

## File Structure

```
claude-code-digest/
├── manifest.json      # Chrome extension manifest (v3)
├── popup.html         # Main popup HTML structure
├── popup.css          # Styles for the popup interface
├── popup.js           # Core functionality and logic
├── icons/
│   ├── icon16.png     # 16x16 toolbar icon
│   ├── icon48.png     # 48x48 extension icon
│   └── icon128.png    # 128x128 store icon
├── INSTRUCTIONS.md    # This file
└── README.md          # Project overview
```

## Technical Details

### Manifest V3

This extension uses Chrome's Manifest V3 format, which provides:
- Enhanced security through service workers
- Improved performance
- Better privacy controls

### Permissions

The extension requires the following permissions:
- **storage**: To save starred items and user settings
- **tts**: For text-to-speech capabilities (optional, uses Web Speech API by default)

### APIs Used

- **Web Speech API** (`window.speechSynthesis`): Provides text-to-speech functionality
- **Chrome Storage API** (`chrome.storage.local`): Persists user data across sessions
- **YouTube IFrame API**: Embeds video players for tutorial content
- **Clipboard API** (`navigator.clipboard`): Enables copy-to-clipboard functionality

## Customization

### Adding New Digest Content

To update the digest content, modify the `DIGEST_CONTENT` object in `popup.js`:

```javascript
const DIGEST_CONTENT = {
  date: "December 2, 2025",
  sections: [
    {
      title: "Section Title",
      items: [
        {
          id: "unique_id",
          title: "Item Title",
          summary: "Item description...",
          source: "Source Name",
          url: "https://example.com",
          videoId: "YouTubeVideoId", // Optional - for video items
          duration: "10 min", // Optional
          read_time: "5 min", // Optional
        }
      ]
    }
  ]
};
```

### Styling

The extension uses CSS custom properties for easy theming. Key variables in `popup.css`:

```css
:root {
  --bg: #1f2121;           /* Background color */
  --surface: #262828;       /* Card/surface color */
  --text: #f5f5f5;          /* Primary text color */
  --text-muted: #a7a9a9;    /* Secondary text color */
  --accent: #32b8c6;        /* Accent/brand color */
  --accent-hover: #41c9d7;  /* Accent hover state */
  --border: #3a3d3d;        /* Border color */
}
```

## Troubleshooting

### Extension Not Loading

1. Ensure Developer mode is enabled in `chrome://extensions`
2. Check that all files are present in the extension folder
3. Look for error messages in the Extensions page

### Audio Not Playing

1. Check that your browser allows audio playback
2. Try refreshing the extension (click the refresh icon on the Extensions page)
3. Ensure no other speech synthesis is active

### Videos Not Loading

1. YouTube embeds require an internet connection
2. Some ad blockers may interfere with embedded videos
3. Try disabling other extensions temporarily

### Settings Not Saving

1. Ensure the extension has storage permission
2. Try removing and re-adding the extension
3. Clear Chrome's extension storage and retry

## Development

### Local Development

1. Make changes to the source files
2. Go to `chrome://extensions`
3. Click the refresh icon on the Claude Code Digest card
4. Click the extension icon to see your changes

### Debugging

1. Right-click the extension popup
2. Select "Inspect" to open DevTools
3. Check the Console tab for errors
4. Use the Network tab to debug API calls

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source. See the LICENSE file for details.

## Support

If you encounter issues or have feature requests, please open an issue on the GitHub repository.

---

**Built with ❤️ for the Claude Code community**
