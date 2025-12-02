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
  SETTINGS: "ccd_settings"
};

let starredItems = new Set();
let settings = {
  speechRate: 1.0,
  theme: "dark"
};

let currentUtterance = null;
let currentReadingId = null;

// Helpers

function loadStorage() {
  return new Promise((resolve) => {
    if (!chrome?.storage?.local) {
      resolve();
      return;
    }
    chrome.storage.local.get(
      [STORAGE_KEYS.STARRED, STORAGE_KEYS.SETTINGS],
      (res) => {
        if (Array.isArray(res[STORAGE_KEYS.STARRED])) {
          starredItems = new Set(res[STORAGE_KEYS.STARRED]);
        }
        if (res[STORAGE_KEYS.SETTINGS]) {
          settings = { ...settings, ...res[STORAGE_KEYS.SETTINGS] };
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

function speakText(text, id) {
  stopSpeech();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = settings.speechRate;
  currentUtterance = utterance;
  currentReadingId = id;

  // Visual highlight
  updateReadingHighlight();

  utterance.onend = () => {
    currentUtterance = null;
    currentReadingId = null;
    updateReadingHighlight();
  };

  window.speechSynthesis.speak(utterance);
}

function stopSpeech() {
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
  }
  currentUtterance = null;
  currentReadingId = null;
  updateReadingHighlight();
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
      itemEl.className = "item";
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

      actions.appendChild(playBtn);
      actions.appendChild(starBtn);

      main.appendChild(title);
      main.appendChild(meta);
      main.appendChild(summary);
      main.appendChild(actions);

      headerRow.appendChild(main);
      itemEl.appendChild(headerRow);

      // Inline video only for Must-Watch Videos
      if (section.title === "Must-Watch Videos" && item.videoId) {
        const videoWrapper = document.createElement("div");
        videoWrapper.className = "video-wrapper";

        const iframe = document.createElement("iframe");
        const params = new URLSearchParams({
          rel: "0",
          modestbranding: "1",
          controls: "1",
          autoplay: "0"
        });
        iframe.src = `https://www.youtube.com/embed/${item.videoId}?${params.toString()}`;
        iframe.title = item.title;
        iframe.allow =
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;

        videoWrapper.appendChild(iframe);
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

  const speedSelect = document.getElementById("speed-select");
  speedSelect.value = String(settings.speechRate);
  speedSelect.addEventListener("change", () => {
    settings.speechRate = parseFloat(speedSelect.value);
    saveSettings();
  });

  document
    .getElementById("play-all-btn")
    .addEventListener("click", () => {
      const text = collectAllSpeechText();
      speakText(text, "ALL");
    });

  document.getElementById("pause-btn").addEventListener("click", () => {
    pauseSpeech();
  });

  document.getElementById("resume-btn").addEventListener("click", () => {
    resumeSpeech();
  });

  document.getElementById("stop-btn").addEventListener("click", () => {
    stopSpeech();
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

  voiceRate.addEventListener("change", () => {
    const rate = parseFloat(voiceRate.value);
    settings.speechRate = rate;
    document.getElementById("speed-select").value = voiceRate.value;
    saveSettings();
  });

  themeToggle.addEventListener("change", () => {
    settings.theme = themeToggle.checked ? "dark" : "dark"; // future: add light
    saveSettings();
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadStorage();
  renderDigest();
  initUI();
});
