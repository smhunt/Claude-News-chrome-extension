// Hardcoded digest content for now
const DIGEST_CONTENT = {
  date: "December 1, 2025",
  sections: [
    {
      title: "Must-Watch Videos",
      items: [
        {
          id: "vid_1",
          title: "Claude Code: From Zero to Pro (Ultimate 2025 Guide)",
          summary:
            "Full setup guide covering Claude Code in VS Code/Cursor, initializing projects with CLAUDE.md, and running end-to-end agentic workflows.",
          source: "YouTube",
          url: "https://www.youtube.com/watch?v=P-5bWpUbO60",
          videoId: "P-5bWpUbO60",
          duration: "45 min"
        },
        {
          id: "vid_2",
          title: "Full Tutorial: 20 Tips to Master Claude Code in 35 Minutes",
          summary:
            "20 concrete tips for plan→execute workflows, debugging, CLAUDE.md strategies, GitHub integration, and API wiring.",
          source: "YouTube",
          url: "https://www.youtube.com/watch?v=jWlAvdR8HG0",
          videoId: "jWlAvdR8HG0",
          duration: "35 min"
        },
        {
          id: "vid_3",
          title: "Claude Code Programming Tutorial for Beginners",
          summary:
            "VS Code-centric walkthrough showing installation, setup, and building a real feature on a sample web app.",
          source: "YouTube",
          url: "https://www.youtube.com/watch?v=hewApCHwXh0",
          videoId: "hewApCHwXh0",
          duration: "25 min"
        }
      ]
    },
    {
      title: "Best-Practice Reading",
      items: [
        {
          id: "read_1",
          title: "Claude Code: Best practices for agentic coding",
          summary:
            "Official Anthropic guidance on CLAUDE.md, planning vs execution, permissions, and safe autonomy in real projects.",
          source: "Anthropic Engineering",
          url: "https://www.anthropic.com/engineering/claude-code-best-practices",
          read_time: "8 min"
        },
        {
          id: "read_2",
          title:
            "Claude Code Best Practices: Tips from Power Users for 2025",
          summary:
            "Power-user techniques including modularization, custom slash commands, permission modes, and testing strategies.",
          source: "Sidetool",
          url: "https://www.sidetool.co/post/claude-code-best-practices-tips-power-users-2025/",
          read_time: "12 min"
        },
        {
          id: "read_3",
          title:
            "My 7 essential Claude Code best practices for production-ready AI",
          summary:
            "Opinionated list covering CLAUDE.md usage, the plan-then-execute pattern, hooks, and monitoring strategies.",
          source: "eesel AI",
          url: "https://www.eesel.ai/blog/claude-code-best-practices",
          read_time: "10 min"
        }
      ]
    },
    {
      title: "Workflow Deep Dives",
      items: [
        {
          id: "deep_1",
          title: "GitHub – anthropics/claude-code",
          summary:
            "Official CLI repo with examples of agentic coding flows, commands, configuration, and real project patterns.",
          source: "GitHub",
          url: "https://github.com/anthropics/claude-code",
          type: "Repository"
        },
        {
          id: "deep_2",
          title: "claude-code-workflows (dual-loop architecture)",
          summary:
            "Shows dual-loop architecture using slash commands and GitHub Actions to automate PR review and quality checks.",
          source: "GitHub",
          url: "https://github.com/OneRedOak/claude-code-workflows",
          type: "Repository"
        },
        {
          id: "deep_3",
          title: "VS Code Claude Code Guide (2025)",
          summary:
            "Complete guide to installing, configuring, and mastering the VS Code integration with workflow examples and troubleshooting.",
          source: "eesel AI",
          url: "https://www.eesel.ai/blog/vs-code-claude-code",
          read_time: "11 min"
        }
      ]
    },
    {
      title: "Practice Task",
      items: [
        {
          id: "task_1",
          title: "Refine CLAUDE.md in Your Next Project",
          summary:
            "Pick one active repo and add or refine a CLAUDE.md describing project goals, coding style, and test commands. Takes 5-10 minutes. Follow ideas from today's best-practice posts.",
          source: "Daily Challenge",
          difficulty: "5-10 min",
          tags: ["CLAUDE.md", "setup", "hands-on"]
        }
      ]
    }
  ]
};

const STORAGE_KEYS = {
  STARRED: "ccd_starred_items",
  SETTINGS: "ccd_settings",
  PLAYLIST: "ccd_playlist",
  READ_ITEMS: "ccd_read_items"
};

let starredItems = new Set();
let readItems = new Set();
let settings = {
  speechRate: 0.8,
  voiceName: "Rocko",
  theme: "dark"
};

// Playlist: array of video objects { id, title, videoId, url, addedAt }
let playlist = [];

// Speech queue for sequential playback
let speechQueue = [];
let isPlayingAll = false;

let currentUtterance = null;
let currentReadingId = null;
let currentSpeechText = null; // Track text for restarting with new settings
let availableVoices = [];

// Helpers

function loadStorage() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve();
      return;
    }
    chrome.storage.local.get(
      [STORAGE_KEYS.STARRED, STORAGE_KEYS.SETTINGS, STORAGE_KEYS.PLAYLIST, STORAGE_KEYS.READ_ITEMS],
      (res) => {
        if (Array.isArray(res[STORAGE_KEYS.STARRED])) {
          starredItems = new Set(res[STORAGE_KEYS.STARRED]);
        }
        if (res[STORAGE_KEYS.SETTINGS]) {
          settings = { ...settings, ...res[STORAGE_KEYS.SETTINGS] };
        }
        if (Array.isArray(res[STORAGE_KEYS.PLAYLIST])) {
          playlist = res[STORAGE_KEYS.PLAYLIST];
        }
        if (Array.isArray(res[STORAGE_KEYS.READ_ITEMS])) {
          readItems = new Set(res[STORAGE_KEYS.READ_ITEMS]);
        }
        resolve();
      }
    );
  });
}

function saveStarred() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({
    [STORAGE_KEYS.STARRED]: Array.from(starredItems)
  });
}

function saveSettings() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({
    [STORAGE_KEYS.SETTINGS]: settings
  });
}

function savePlaylist() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({
    [STORAGE_KEYS.PLAYLIST]: playlist
  });
}

function saveReadItems() {
  if (!chrome?.storage?.local) return;
  chrome.storage.local.set({
    [STORAGE_KEYS.READ_ITEMS]: Array.from(readItems)
  });
}

function markAsRead(itemId) {
  readItems.add(itemId);
  saveReadItems();
  updateReadIndicators();
}

function markAsUnread(itemId) {
  readItems.delete(itemId);
  saveReadItems();
  updateReadIndicators();
}

function toggleReadState(itemId) {
  if (readItems.has(itemId)) {
    markAsUnread(itemId);
  } else {
    markAsRead(itemId);
  }
}

function isRead(itemId) {
  return readItems.has(itemId);
}

function updateReadIndicators() {
  document.querySelectorAll(".item").forEach((el) => {
    const id = el.getAttribute("data-id");
    if (id && readItems.has(id)) {
      el.classList.add("item-read");
    } else {
      el.classList.remove("item-read");
    }
  });

  // Update read toggle buttons
  document.querySelectorAll(".read-toggle-btn").forEach((btn) => {
    const id = btn.dataset.id;
    if (readItems.has(id)) {
      btn.textContent = "●";
      btn.title = "Mark as unread";
    } else {
      btn.textContent = "○";
      btn.title = "Mark as read";
    }
  });

  // Update unread count
  updateUnreadCount();
}

function updateUnreadCount() {
  let totalItems = 0;
  DIGEST_CONTENT.sections.forEach(section => {
    totalItems += section.items.length;
  });
  const unreadCount = totalItems - readItems.size;

  const countEl = document.getElementById("unread-count");
  if (countEl) {
    countEl.textContent = unreadCount > 0 ? `${unreadCount} unread` : "All read";
  }
}

function addToPlaylist(item) {
  // Check if already in playlist
  if (playlist.some(p => p.videoId === item.videoId)) {
    return false;
  }
  playlist.push({
    id: item.id,
    title: item.title,
    videoId: item.videoId,
    url: item.url,
    summary: item.summary,
    duration: item.duration,
    addedAt: Date.now()
  });
  savePlaylist();
  renderPlaylist();
  return true;
}

function removeFromPlaylist(videoId) {
  playlist = playlist.filter(p => p.videoId !== videoId);
  savePlaylist();
  renderPlaylist();
}

function isInPlaylist(videoId) {
  return playlist.some(p => p.videoId === videoId);
}

function renderPlaylist() {
  const container = document.getElementById("playlist-container");
  if (!container) return;

  if (playlist.length === 0) {
    container.innerHTML = `
      <div class="playlist-empty">
        <p>No videos in playlist</p>
        <p class="playlist-hint">Click "+ Playlist" on any video to add it</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  playlist.forEach((item, index) => {
    const itemEl = document.createElement("div");
    itemEl.className = "playlist-item";
    itemEl.innerHTML = `
      <div class="playlist-item-thumb">
        <img src="https://img.youtube.com/vi/${item.videoId}/default.jpg" alt="">
        <span class="playlist-item-index">${index + 1}</span>
      </div>
      <div class="playlist-item-info">
        <a href="${item.url}" target="_blank" class="playlist-item-title">${item.title}</a>
        <span class="playlist-item-duration">${item.duration || ''}</span>
      </div>
      <div class="playlist-item-actions">
        <button class="playlist-play-btn" data-video-id="${item.videoId}" title="Play">▶</button>
        <button class="playlist-remove-btn" data-video-id="${item.videoId}" title="Remove">✕</button>
      </div>
    `;
    container.appendChild(itemEl);
  });

  // Add event listeners
  container.querySelectorAll(".playlist-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromPlaylist(btn.dataset.videoId);
      updatePlaylistButtons();
    });
  });

  container.querySelectorAll(".playlist-play-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = playlist.find(p => p.videoId === btn.dataset.videoId);
      if (item) window.open(item.url, "_blank");
    });
  });

  // Update playlist count badge
  const badge = document.getElementById("playlist-count");
  if (badge) {
    badge.textContent = playlist.length;
    badge.style.display = playlist.length > 0 ? "inline-flex" : "none";
  }
}

function updatePlaylistButtons() {
  document.querySelectorAll(".add-playlist-btn").forEach(btn => {
    const videoId = btn.dataset.videoId;
    const inPlaylist = isInPlaylist(videoId);
    btn.textContent = inPlaylist ? "✓ Added" : "+ Playlist";
    btn.classList.toggle("in-playlist", inPlaylist);
  });
}

function getSelectedVoice() {
  if (!settings.voiceName) return null;
  return availableVoices.find(v => v.name === settings.voiceName) || null;
}

function populateVoiceDropdowns() {
  availableVoices = speechSynthesis.getVoices();

  // Filter to English voices first, then add others
  const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
  const otherVoices = availableVoices.filter(v => !v.lang.startsWith('en'));
  const sortedVoices = [...englishVoices, ...otherVoices];

  const voiceSelect = document.getElementById("voice-select");
  const settingsVoice = document.getElementById("settings-voice");

  const buildOptions = (select) => {
    select.innerHTML = "";

    // Add default option
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "Default";
    select.appendChild(defaultOpt);

    // Add voice options
    sortedVoices.forEach(voice => {
      const opt = document.createElement("option");
      opt.value = voice.name;
      opt.textContent = `${voice.name} (${voice.lang})`;
      if (voice.name === settings.voiceName) {
        opt.selected = true;
      }
      select.appendChild(opt);
    });
  };

  if (voiceSelect) buildOptions(voiceSelect);
  if (settingsVoice) buildOptions(settingsVoice);
}

// Ensure voices are loaded before speaking
function ensureVoicesLoaded() {
  return new Promise((resolve) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
    } else {
      speechSynthesis.onvoiceschanged = () => {
        resolve(speechSynthesis.getVoices());
      };
      // Timeout fallback
      setTimeout(() => resolve(speechSynthesis.getVoices()), 1000);
    }
  });
}

// Watchdog to detect stuck speech
let speechWatchdog = null;

function clearSpeechWatchdog() {
  if (speechWatchdog) {
    clearTimeout(speechWatchdog);
    speechWatchdog = null;
  }
}

function startSpeechWatchdog(expectedDuration) {
  clearSpeechWatchdog();
  // If speech takes longer than expected + 10 seconds, assume it's stuck
  const timeout = Math.max(expectedDuration * 1000 + 10000, 15000);
  speechWatchdog = setTimeout(() => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      console.warn("Speech watchdog: detected stuck speech, resetting...");
      window.speechSynthesis.cancel();
      currentUtterance = null;
      currentReadingId = null;
      updateReadingHighlight();
    }
  }, timeout);
}

function speakText(text, id) {
  // Cancel any existing speech first
  window.speechSynthesis.cancel();
  clearSpeechWatchdog();

  currentUtterance = null;
  currentReadingId = null;
  currentSpeechText = text; // Store for restart on settings change

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.speechRate;

  // Get voice synchronously (voices should be pre-loaded on init)
  const selectedVoice = getSelectedVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  currentUtterance = utterance;
  currentReadingId = id;

  // Visual highlight
  updateReadingHighlight();

  // Estimate speech duration (rough: ~150 words per minute at 1x speed)
  const wordCount = text.split(/\s+/).length;
  const estimatedSeconds = (wordCount / 150) * 60 / settings.speechRate;
  startSpeechWatchdog(estimatedSeconds);

  utterance.onend = () => {
    clearSpeechWatchdog();
    currentUtterance = null;
    currentReadingId = null;
    updateReadingHighlight();
  };

  utterance.onerror = (event) => {
    // Ignore "canceled" errors from intentional stops
    if (event.error === "canceled") return;

    console.error("Speech error:", event.error);
    clearSpeechWatchdog();
    currentUtterance = null;
    currentReadingId = null;
    updateReadingHighlight();
  };

  // Must be synchronous from user gesture - no awaits before this!
  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  clearSpeechWatchdog();
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  currentReadingId = null;
  currentSpeechText = null;
  updateReadingHighlight();
}

// Restart current speech with new settings (voice/speed change while playing)
function restartSpeechWithNewSettings() {
  if (currentSpeechText && (window.speechSynthesis.speaking || window.speechSynthesis.pending)) {
    const text = currentSpeechText;
    const id = currentReadingId;
    speakText(text, id);
  }
}

// Clear any stuck speech state on init
function initSpeechSynthesis() {
  window.speechSynthesis.cancel();

  // Wake up Chrome's speech engine with a silent utterance
  // This forces voice loading and primes the audio context
  const wakeUp = new SpeechSynthesisUtterance("");
  wakeUp.volume = 0;
  window.speechSynthesis.speak(wakeUp);
  window.speechSynthesis.cancel();

  // Pre-warm voices
  ensureVoicesLoaded().then(() => {
    populateVoiceDropdowns();
  });
}

function pauseSpeech() {
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
  }
}

function resumeSpeech() {
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }
}

function buildItemSpeechText(section, item) {
  return `${section.title}. ${item.title}. ${item.summary}`;
}

function collectAllSpeechText() {
  const bits = [];
  bits.push(`Claude Code digest for ${DIGEST_CONTENT.date}.`);
  for (const section of DIGEST_CONTENT.sections) {
    bits.push(section.title + ".");
    for (const item of section.items) {
      bits.push(item.title + ".");
      bits.push(item.summary);
    }
  }
  return bits.join(" ");
}

// Build queue of unread items for sequential playback
function buildUnreadQueue() {
  const queue = [];
  for (const section of DIGEST_CONTENT.sections) {
    for (const item of section.items) {
      if (!readItems.has(item.id)) {
        queue.push({
          id: item.id,
          text: buildItemSpeechText(section, item)
        });
      }
    }
  }
  return queue;
}

// Play all unread items sequentially
function playAllUnread() {
  speechQueue = buildUnreadQueue();

  if (speechQueue.length === 0) {
    // All items are read - maybe play an announcement?
    speakText("All items have been read.", "DONE");
    return;
  }

  isPlayingAll = true;

  // Add intro
  const intro = `Claude Code digest for ${DIGEST_CONTENT.date}. ${speechQueue.length} unread items.`;
  speakTextSequential(intro, "INTRO", () => {
    playNextInQueue();
  });
}

// Play next item in queue
function playNextInQueue() {
  if (!isPlayingAll || speechQueue.length === 0) {
    isPlayingAll = false;
    // Play outro
    speakText("That's all for today's digest. Thanks for listening!", "OUTRO");
    return;
  }

  const nextItem = speechQueue.shift();
  speakTextSequential(nextItem.text, nextItem.id, () => {
    // Mark as read when done
    markAsRead(nextItem.id);
    // Play next
    playNextInQueue();
  });
}

// Sequential speech with callback on completion
function speakTextSequential(text, id, onComplete) {
  window.speechSynthesis.cancel();
  clearSpeechWatchdog();

  currentUtterance = null;
  currentReadingId = null;
  currentSpeechText = text;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.speechRate;

  const selectedVoice = getSelectedVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  currentUtterance = utterance;
  currentReadingId = id;

  updateReadingHighlight();

  const wordCount = text.split(/\s+/).length;
  const estimatedSeconds = (wordCount / 150) * 60 / settings.speechRate;
  startSpeechWatchdog(estimatedSeconds);

  utterance.onend = () => {
    clearSpeechWatchdog();
    currentUtterance = null;
    currentReadingId = null;
    updateReadingHighlight();
    if (onComplete) onComplete();
  };

  utterance.onerror = (event) => {
    if (event.error === "canceled") return;
    console.error("Speech error:", event.error);
    clearSpeechWatchdog();
    currentUtterance = null;
    currentReadingId = null;
    updateReadingHighlight();
  };

  window.speechSynthesis.speak(utterance);
}

// Stop all playback including queue
function stopAllPlayback() {
  isPlayingAll = false;
  speechQueue = [];
  stopSpeech();
}

function updateReadingHighlight() {
  const allItems = document.querySelectorAll(".item");
  allItems.forEach((el) => {
    const id = el.getAttribute("data-id");
    if (id && id === currentReadingId) {
      el.classList.add("item-reading");
    } else {
      el.classList.remove("item-reading");
    }
  });
}

function buildCopySummary() {
  const lines = [];
  lines.push(`Claude Code Digest – ${DIGEST_CONTENT.date}`);
  lines.push("");

  for (const section of DIGEST_CONTENT.sections) {
    lines.push(`## ${section.title}`);
    for (const item of section.items) {
      lines.push(`- ${item.title} — ${item.summary}`);
    }
    lines.push("");
  }
  return lines.join("\n");
}

function buildPodcastScript() {
  const lines = [];

  // Intro
  lines.push(`Welcome to the Claude Code Digest for ${DIGEST_CONTENT.date}.`);
  lines.push("Here's what's new in the world of Claude Code today.");
  lines.push("");

  for (let i = 0; i < DIGEST_CONTENT.sections.length; i++) {
    const section = DIGEST_CONTENT.sections[i];

    // Section intro
    if (i === 0) {
      lines.push(`Let's start with ${section.title}.`);
    } else {
      lines.push(`Next up, ${section.title}.`);
    }
    lines.push("");

    // Items
    for (const item of section.items) {
      lines.push(`${item.title}.`);
      lines.push(item.summary);
      lines.push("");
    }
  }

  // Outro
  lines.push("That's all for today's Claude Code Digest.");
  lines.push("Thanks for listening, and happy coding!");

  return lines.join("\n");
}

// Render

function renderDigest() {
  const container = document.getElementById("digest-container");
  container.innerHTML = "";

  for (const section of DIGEST_CONTENT.sections) {
    const sectionEl = document.createElement("section");
    sectionEl.className = "section";

    const header = document.createElement("div");
    header.className = "section-header";
    const titleSpan = document.createElement("div");
    titleSpan.className = "section-title";
    titleSpan.textContent = section.title;
    const badge = document.createElement("div");
    badge.className = "section-badge";
    badge.textContent = "Daily";

    header.appendChild(titleSpan);
    header.appendChild(badge);
    sectionEl.appendChild(header);

    for (const item of section.items) {
      const itemEl = document.createElement("div");
      itemEl.className = "item" + (readItems.has(item.id) ? " item-read" : "");
      itemEl.dataset.id = item.id;

      const headerRow = document.createElement("div");
      headerRow.className = "item-header";

      const main = document.createElement("div");
      main.className = "item-main";

      const title = document.createElement("div");
      title.className = "item-title";
      const link = document.createElement("a");
      link.href = item.url || "#";
      link.target = "_blank";
      link.textContent = item.title;
      title.appendChild(link);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      const metaBits = [];
      if (item.source) metaBits.push(item.source);
      if (item.duration) metaBits.push(item.duration);
      if (item.read_time) metaBits.push(item.read_time);
      if (item.difficulty) metaBits.push(item.difficulty);
      if (item.type) metaBits.push(item.type);
      meta.textContent = metaBits.join(" · ");

      const summary = document.createElement("div");
      summary.className = "item-summary";
      summary.textContent = item.summary;

      const actions = document.createElement("div");
      actions.className = "item-actions";

      const playBtn = document.createElement("button");
      playBtn.className = "play-item-btn";
      playBtn.innerHTML = "🔊 <span>Play</span>";
      playBtn.addEventListener("click", () => {
        const text = buildItemSpeechText(section, item);
        speakText(text, item.id);
      });

      const starBtn = document.createElement("button");
      starBtn.className = "star-btn";
      starBtn.dataset.starred = starredItems.has(item.id) ? "true" : "false";
      starBtn.textContent =
        starBtn.dataset.starred === "true" ? "★" : "☆";
      starBtn.title = "Star item";
      starBtn.addEventListener("click", () => {
        if (starredItems.has(item.id)) {
          starredItems.delete(item.id);
        } else {
          starredItems.add(item.id);
        }
        starBtn.dataset.starred = starredItems.has(item.id)
          ? "true"
          : "false";
        starBtn.textContent =
          starBtn.dataset.starred === "true" ? "★" : "☆";
        saveStarred();
      });

      // Read toggle button
      const readToggleBtn = document.createElement("button");
      readToggleBtn.className = "read-toggle-btn";
      readToggleBtn.dataset.id = item.id;
      readToggleBtn.textContent = readItems.has(item.id) ? "●" : "○";
      readToggleBtn.title = readItems.has(item.id) ? "Mark as unread" : "Mark as read";
      readToggleBtn.addEventListener("click", () => {
        toggleReadState(item.id);
      });

      actions.appendChild(playBtn);
      actions.appendChild(starBtn);
      actions.appendChild(readToggleBtn);

      // Add playlist button for video items
      if (item.videoId) {
        const playlistBtn = document.createElement("button");
        playlistBtn.className = "add-playlist-btn";
        playlistBtn.dataset.videoId = item.videoId;
        const inPlaylist = isInPlaylist(item.videoId);
        playlistBtn.textContent = inPlaylist ? "✓ Added" : "+ Playlist";
        playlistBtn.classList.toggle("in-playlist", inPlaylist);
        playlistBtn.addEventListener("click", () => {
          if (isInPlaylist(item.videoId)) {
            removeFromPlaylist(item.videoId);
          } else {
            addToPlaylist(item);
          }
          updatePlaylistButtons();
        });
        actions.appendChild(playlistBtn);
      }

      main.appendChild(title);
      main.appendChild(meta);
      main.appendChild(summary);
      main.appendChild(actions);

      headerRow.appendChild(main);
      itemEl.appendChild(headerRow);

      // Video thumbnail with "Watch on YouTube" button for Must-Watch Videos
      if (section.title === "Must-Watch Videos" && item.videoId) {
        const videoWrapper = document.createElement("div");
        videoWrapper.className = "video-wrapper";

        const thumbnailLink = document.createElement("a");
        thumbnailLink.href = item.url;
        thumbnailLink.target = "_blank";
        thumbnailLink.className = "video-thumbnail-link";

        const thumbnail = document.createElement("img");
        thumbnail.src = `https://img.youtube.com/vi/${item.videoId}/mqdefault.jpg`;
        thumbnail.alt = item.title;
        thumbnail.className = "video-thumbnail";

        const playOverlay = document.createElement("div");
        playOverlay.className = "video-play-overlay";
        playOverlay.innerHTML = "▶";

        thumbnailLink.appendChild(thumbnail);
        thumbnailLink.appendChild(playOverlay);
        videoWrapper.appendChild(thumbnailLink);
        itemEl.appendChild(videoWrapper);
      }

      sectionEl.appendChild(itemEl);
    }

    container.appendChild(sectionEl);
  }
}

function initUI() {
  document.getElementById("digest-date").textContent = DIGEST_CONTENT.date;
  document.getElementById("last-updated").textContent =
    "Updated: " + DIGEST_CONTENT.date;

  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  speedSlider.value = settings.speechRate;
  speedValue.textContent = settings.speechRate.toFixed(1) + "x";

  speedSlider.addEventListener("input", () => {
    const rate = parseFloat(speedSlider.value);
    settings.speechRate = rate;
    speedValue.textContent = rate.toFixed(1) + "x";

    // Sync with settings panel slider
    const voiceRate = document.getElementById("voice-rate");
    const settingsSpeedValue = document.getElementById("settings-speed-value");
    if (voiceRate) voiceRate.value = rate;
    if (settingsSpeedValue) settingsSpeedValue.textContent = rate.toFixed(1) + "x";

    saveSettings();
    restartSpeechWithNewSettings();
  });

  document
    .getElementById("play-all-btn")
    .addEventListener("click", () => {
      playAllUnread();
    });

  document.getElementById("pause-btn").addEventListener("click", () => {
    pauseSpeech();
  });

  document.getElementById("resume-btn").addEventListener("click", () => {
    resumeSpeech();
  });

  document.getElementById("stop-btn").addEventListener("click", () => {
    stopAllPlayback();
  });

  document.getElementById("refresh-btn").addEventListener("click", () => {
    // Currently just re-renders static content
    stopSpeech();
    renderDigest();
  });

  document.getElementById("copy-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(buildCopySummary());
    } catch (e) {
      console.error("Copy failed", e);
    }
  });

  document.getElementById("podcast-btn").addEventListener("click", async () => {
    try {
      // Build podcast script text
      const podcastText = buildPodcastScript();
      await navigator.clipboard.writeText(podcastText);

      // Open TTS website
      window.open("https://ttsmp3.com/", "_blank");
    } catch (e) {
      console.error("Podcast generation failed", e);
    }
  });

  const settingsBtn = document.getElementById("settings-btn");
  const settingsPanel = document.getElementById("settings-panel");
  const settingsCloseBtn = document.getElementById("settings-close-btn");
  const themeToggle = document.getElementById("theme-toggle");
  const voiceRate = document.getElementById("voice-rate");

  voiceRate.value = String(settings.speechRate);
  themeToggle.checked = settings.theme === "dark";

  settingsBtn.addEventListener("click", () => {
    settingsPanel.classList.remove("hidden");
  });

  settingsCloseBtn.addEventListener("click", () => {
    settingsPanel.classList.add("hidden");
  });

  const settingsSpeedValue = document.getElementById("settings-speed-value");
  voiceRate.value = settings.speechRate;
  if (settingsSpeedValue) settingsSpeedValue.textContent = settings.speechRate.toFixed(1) + "x";

  voiceRate.addEventListener("input", () => {
    const rate = parseFloat(voiceRate.value);
    settings.speechRate = rate;
    if (settingsSpeedValue) settingsSpeedValue.textContent = rate.toFixed(1) + "x";

    // Sync with main slider
    const speedSlider = document.getElementById("speed-slider");
    const speedValue = document.getElementById("speed-value");
    if (speedSlider) speedSlider.value = rate;
    if (speedValue) speedValue.textContent = rate.toFixed(1) + "x";

    saveSettings();
    restartSpeechWithNewSettings();
  });

  themeToggle.addEventListener("change", () => {
    settings.theme = themeToggle.checked ? "dark" : "light";
    saveSettings();
  });

  // Voice selection handlers
  const voiceSelect = document.getElementById("voice-select");
  const settingsVoice = document.getElementById("settings-voice");

  voiceSelect.addEventListener("change", () => {
    settings.voiceName = voiceSelect.value;
    if (settingsVoice) settingsVoice.value = voiceSelect.value;
    saveSettings();
    restartSpeechWithNewSettings();
  });

  settingsVoice.addEventListener("change", () => {
    settings.voiceName = settingsVoice.value;
    if (voiceSelect) voiceSelect.value = settingsVoice.value;
    saveSettings();
    restartSpeechWithNewSettings();
  });

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const tabName = btn.dataset.tab;

      // Update active tab button
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      // Update active tab content
      document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.remove("active");
      });
      document.getElementById(tabName === "digest" ? "digest-container" : "playlist-container")
        .classList.add("active");
    });
  });

  // Side panel and popout buttons (only in popup, not in panel mode)
  const sidePanelBtn = document.getElementById("side-panel-btn");
  const popoutBtn = document.getElementById("popout-btn");

  if (sidePanelBtn && !document.body.classList.contains("panel-mode")) {
    sidePanelBtn.addEventListener("click", async () => {
      try {
        // Get current tab to get windowId
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
          await chrome.sidePanel.open({ windowId: tab.windowId });
          window.close(); // Close popup after opening side panel
        }
      } catch (e) {
        console.error("Failed to open side panel:", e);
      }
    });
  }

  if (popoutBtn && !document.body.classList.contains("panel-mode")) {
    popoutBtn.addEventListener("click", () => {
      chrome.runtime.sendMessage({ action: "openPopout" });
      window.close(); // Close popup after opening popout
    });
  }

  // Hide these buttons in panel mode
  if (document.body.classList.contains("panel-mode")) {
    if (sidePanelBtn) sidePanelBtn.style.display = "none";
    if (popoutBtn) popoutBtn.style.display = "none";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadStorage();
  renderDigest();
  renderPlaylist();
  initUI();
  updateUnreadCount();

  // Initialize speech synthesis (clears stuck state, pre-loads voices)
  initSpeechSynthesis();
});
