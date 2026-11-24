/* ==========================================================================
   Cairn Public Site — Interactive Trailhead Controls
   Zero external requests · Accessible roving tabindex · Zero-CLS state swaps
   ========================================================================== */
(function () {
  "use strict";

  var links = window.CAIRN_LINKS || {};
  var siteUrl = links.siteUrl || window.location.href.split("#")[0];
  var storeUrl = (links.chromeWebStoreUrl || "").trim();
  var whatsappChannelUrl = (links.whatsappChannelUrl || "").trim();
  var issuesUrl = links.githubIssuesUrl || "https://github.com/mohdashraf010897/cairn-public/issues";
  var featurePulseUrl =
    links.githubFeaturePulseUrl ||
    "https://github.com/mohdashraf010897/cairn-public/issues/new";

  /* ── 1. Theme Toggle (Limestone Mist <-> Night Ridge) ─────────────────── */
  var root = document.documentElement;
  var themeBtn = document.getElementById("theme-toggle");
  var themeLabel = document.getElementById("theme-toggle-label");
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function syncThemeUi(theme) {
    var isDark = theme === "dark";
    root.setAttribute("data-theme", isDark ? "dark" : "light");
    if (themeBtn) {
      themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
    }
    if (themeLabel) {
      themeLabel.textContent = isDark ? "Night Ridge" : "Daylight";
    }
    if (metaTheme) {
      metaTheme.setAttribute("content", isDark ? "#0b100e" : "#f3f6f4");
    }
  }

  syncThemeUi(root.getAttribute("data-theme") || "light");

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      try {
        localStorage.setItem("cairn-theme", next);
      } catch (_) {}
      syncThemeUi(next);
    });
  }

  /* ── 2. Device-Smart Install & WhatsApp Links ─────────────────────────── */
  var ua = navigator.userAgent || "";
  var isMobileUa = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua);
  var narrowMq = window.matchMedia ? window.matchMedia("(max-width: 720px)") : null;

  function refreshMobileClass() {
    var mobile = isMobileUa || Boolean(narrowMq && narrowMq.matches);
    document.body.classList.toggle("is-mobile-device", mobile);
  }
  refreshMobileClass();
  if (narrowMq && narrowMq.addEventListener) {
    narrowMq.addEventListener("change", refreshMobileClass);
  }

  /* Wire primary install anchors: direct CWS when live, #get-cairn section before CWS */
  var installLinks = document.querySelectorAll("[data-cairn-install]");
  installLinks.forEach(function (el) {
    if (storeUrl) {
      el.setAttribute("href", storeUrl);
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    } else {
      el.setAttribute("href", "#get-cairn");
    }
  });

  var cwsStatusBadge = document.getElementById("cws-status-text");
  if (cwsStatusBadge && storeUrl) {
    cwsStatusBadge.textContent = "Live on the Chrome Web Store — installs in one click.";
  }

  /* Wire WhatsApp save-to-self & share links */
  var saveMsg =
    links.whatsappDesktopSaveText ||
    "Save Cairn for my laptop (intentional YouTube Chrome extension): " + siteUrl;
  var shareMsg =
    links.whatsappShareText ||
    "Cairn for Chrome — open YouTube for one thing and leave when done: " + siteUrl;

  document.querySelectorAll("[data-wa-save]").forEach(function (el) {
    el.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(saveMsg));
  });

  document.querySelectorAll("[data-wa-share]").forEach(function (el) {
    el.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(shareMsg));
  });

  document.querySelectorAll("[data-email-self]").forEach(function (el) {
    var subj = "Install Cairn on Chrome (Desktop link)";
    var body =
      "Open this on your laptop in Chrome to install Cairn (Intentional Viewing for YouTube):\n\n" +
      (storeUrl || siteUrl);
    el.setAttribute(
      "href",
      "mailto:?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body)
    );
  });

  /* Official WhatsApp Channel button: live channel when configured, honest fallback before */
  var channelBtn = document.getElementById("wa-channel-btn");
  var channelNote = document.getElementById("wa-channel-note");
  if (channelBtn) {
    if (whatsappChannelUrl) {
      channelBtn.setAttribute("href", whatsappChannelUrl);
      channelBtn.textContent = "Follow Cairn on WhatsApp Channel";
      if (channelNote) {
        channelNote.textContent = "Quiet release notes only — new versions and Chrome Web Store drop.";
      }
    } else {
      channelBtn.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(saveMsg));
      channelBtn.textContent = "Save Link to My WhatsApp";
      if (channelNote) {
        channelNote.textContent =
          "Official WhatsApp broadcast channel opens at Chrome Web Store launch — save Cairn to your 'Message Yourself' chat today or share the 22s walkthrough.";
      }
    }
  }

  /* Copy link buttons with inline feedback + polite live toast + clipboard error safety */
  var copyToast = document.getElementById("copy-toast");
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    var defaultLabel = btn.textContent.trim();
    var resetTimer = null;
    function announceCopy(buttonLabel, toastMessage) {
      btn.textContent = buttonLabel;
      if (copyToast) {
        copyToast.textContent = toastMessage;
      }
      if (resetTimer) {
        window.clearTimeout(resetTimer);
      }
      resetTimer = window.setTimeout(function () {
        btn.textContent = defaultLabel;
      }, 2400);
    }

    btn.addEventListener("click", function () {
      var targetUrl = storeUrl || siteUrl;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(targetUrl)
          .then(function () {
            announceCopy("Copied Desktop Link ✓", "Copied desktop link: " + targetUrl);
          })
          .catch(function () {
            window.prompt("Copy Cairn desktop link:", targetUrl);
            announceCopy("Link Shown to Copy", "Desktop link: " + targetUrl);
          });
      } else {
        window.prompt("Copy Cairn desktop link:", targetUrl);
        announceCopy("Link Shown to Copy", "Desktop link: " + targetUrl);
      }
    });
  });

  /* ── 3. Interactive Zero-CLS Hero Stage (4 Scenarios x Cairn ON/OFF) ──── */
  var scenarioTabs = Array.prototype.slice.call(
    document.querySelectorAll('[data-scenario-tab]')
  );
  var modeSwitch = document.getElementById("cairn-mode-switch");
  var modeSwitchText = document.getElementById("cairn-mode-label");
  var browserUrlEl = document.getElementById("stage-browser-url");
  var activeScenario = "excel";
  var cairnEnabled = true;

  var urlByScenario = {
    excel: "youtube.com/results?search_query=excel+pivot+tables",
    repair: "youtube.com/results?search_query=fix+dripping+kitchen+faucet",
    study: "youtube.com/watch?v=ambient-focus-session",
    lock: "youtube.com · Workday Lock active (5h 42m left)"
  };

  function renderStage() {
    var panes = document.querySelectorAll("[data-stage-pane]");
    var targetKey = activeScenario + "-" + (cairnEnabled ? "on" : "off");
    panes.forEach(function (pane) {
      var match = pane.getAttribute("data-stage-pane") === targetKey;
      pane.setAttribute("aria-hidden", match ? "false" : "true");
    });
    if (modeSwitch) {
      modeSwitch.setAttribute("aria-pressed", cairnEnabled ? "true" : "false");
    }
    if (modeSwitchText) {
      modeSwitchText.textContent = cairnEnabled ? "Cairn: ON" : "Cairn: OFF";
    }
    if (browserUrlEl && urlByScenario[activeScenario]) {
      browserUrlEl.textContent = urlByScenario[activeScenario];
    }
  }

  function activateScenarioTab(tab, focusIt) {
    activeScenario = tab.getAttribute("data-scenario-tab") || "excel";
    scenarioTabs.forEach(function (t) {
      var sel = t === tab;
      t.setAttribute("aria-selected", sel ? "true" : "false");
      t.setAttribute("tabindex", sel ? "0" : "-1");
    });
    if (focusIt) tab.focus();
    renderStage();
  }

  scenarioTabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      activateScenarioTab(tab, false);
    });
    tab.addEventListener("keydown", function (e) {
      var nextIdx = null;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % scenarioTabs.length;
      if (e.key === "ArrowLeft") nextIdx = (idx - 1 + scenarioTabs.length) % scenarioTabs.length;
      if (e.key === "Home") nextIdx = 0;
      if (e.key === "End") nextIdx = scenarioTabs.length - 1;
      if (nextIdx !== null) {
        e.preventDefault();
        activateScenarioTab(scenarioTabs[nextIdx], true);
      }
    });
  });

  if (modeSwitch) {
    modeSwitch.addEventListener("click", function () {
      cairnEnabled = !cairnEnabled;
      renderStage();
    });
  }

  /* ── 4. Walkthrough Video Sound Toggle ────────────────────────────────── */
  var promoVideo = document.getElementById("cairn-walkthrough-video");
  var muteToggle = document.getElementById("video-sound-btn");
  if (promoVideo && muteToggle) {
    muteToggle.addEventListener("click", function () {
      promoVideo.muted = !promoVideo.muted;
      if (!promoVideo.muted && promoVideo.paused) {
        promoVideo.play().catch(function () {});
      }
      muteToggle.setAttribute("aria-pressed", promoVideo.muted ? "false" : "true");
      muteToggle.textContent = promoVideo.muted
        ? "Unmute tactile sound"
        : "Mute sound";
    });
  }

  /* ── 5. Interactive "Impulse Check" Friction Simulator ────────────────── */
  var simTabs = Array.prototype.slice.call(document.querySelectorAll("[data-sim-tab]"));
  var simPanes = document.querySelectorAll("[data-sim-pane]");
  var countdownTimer = null;

  function setSimMode(mode, focusTab) {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
    simTabs.forEach(function (t) {
      var sel = t.getAttribute("data-sim-tab") === mode;
      t.setAttribute("aria-selected", sel ? "true" : "false");
      t.setAttribute("tabindex", sel ? "0" : "-1");
      if (sel && focusTab) t.focus();
    });
    simPanes.forEach(function (p) {
      var match = p.getAttribute("data-sim-pane") === mode;
      p.setAttribute("aria-hidden", match ? "false" : "true");
    });
  }

  simTabs.forEach(function (tab, idx) {
    tab.addEventListener("click", function () {
      setSimMode(tab.getAttribute("data-sim-tab"), false);
    });
    tab.addEventListener("keydown", function (e) {
      var nextIdx = null;
      if (e.key === "ArrowRight") nextIdx = (idx + 1) % simTabs.length;
      if (e.key === "ArrowLeft") nextIdx = (idx - 1 + simTabs.length) % simTabs.length;
      if (nextIdx !== null) {
        e.preventDefault();
        setSimMode(simTabs[nextIdx].getAttribute("data-sim-tab"), true);
      }
    });
  });

  /* Level 1 replacement search demo */
  var simSearchBtn = document.getElementById("sim-search-btn");
  var simSearchInput = document.getElementById("sim-search-input");
  var simLevel1Msg = document.getElementById("sim-level1-feedback");
  if (simSearchBtn && simSearchInput && simLevel1Msg) {
    simSearchBtn.addEventListener("click", function () {
      var q = simSearchInput.value.trim() || "SQL window functions";
      simLevel1Msg.textContent =
        'Focus Mode stays ON -> opens direct search for "' + q + '" (no home feed).';
    });
  }

  /* Level 2 10-second reflection timer */
  var simStartWait = document.getElementById("sim-start-wait");
  var simLevel2Msg = document.getElementById("sim-level2-feedback");
  if (simStartWait && simLevel2Msg) {
    simStartWait.addEventListener("click", function () {
      if (countdownTimer) clearInterval(countdownTimer);
      var left = 5;
      simLevel2Msg.textContent = "Breathing pause: " + left + "s remaining before Turn Off unlocks...";
      countdownTimer = setInterval(function () {
        left -= 1;
        if (left > 0) {
          simLevel2Msg.textContent =
            "Breathing pause: " + left + "s remaining before Turn Off unlocks...";
        } else {
          clearInterval(countdownTimer);
          countdownTimer = null;
          simLevel2Msg.textContent =
            "Pause complete. Most impulse clicks cancel right here and keep Focus Mode ON.";
        }
      }, 650);
    });
  }

  /* Workday Lock break-glass phrase verifier */
  var lockInput = document.getElementById("sim-lock-input");
  var lockBtn = document.getElementById("sim-lock-btn");
  var lockMsg = document.getElementById("sim-lock-feedback");
  if (lockInput && lockBtn && lockMsg) {
    lockBtn.addEventListener("click", function () {
      var val = lockInput.value.trim().toLowerCase();
      if (val === "end this lock early") {
        lockMsg.textContent =
          "Lock ended early — and Focus Mode stays ON so your feed does not snap open automatically.";
      } else {
        lockMsg.textContent =
          'Type exact phrase "end this lock early" — stops unconscious muscle-memory toggling.';
      }
    });
  }

  /* ── 6. Chrome Built-in AI ("Before You Click") Pro Demand Pulse ──────── */
  var pulseYes = document.getElementById("pulse-yes");
  var pulseFree = document.getElementById("pulse-free");
  var pulseResult = document.getElementById("pulse-result");
  var pulseResultText = document.getElementById("pulse-result-text");
  var pulseGithubLink = document.getElementById("pulse-github-link");

  function showPulseChoice(choice) {
    if (!pulseResult || !pulseResultText) return;
    pulseResult.hidden = false;
    if (choice === "yes") {
      pulseResultText.textContent =
        "Noted locally on this browser: you want on-device Chrome AI video previews. Want us to count your vote publicly?";
      if (pulseGithubLink) {
        pulseGithubLink.hidden = false;
        pulseGithubLink.setAttribute("href", featurePulseUrl);
      }
    } else {
      pulseResultText.textContent =
        "Got it — Cairn's core blocker, Intention Gate, and Workday Lock stay $0 and local forever.";
      if (pulseGithubLink) {
        pulseGithubLink.hidden = true;
      }
    }
  }

  try {
    var savedPulse = localStorage.getItem("cairn-pro-pulse");
    if (savedPulse === "yes" || savedPulse === "free") {
      showPulseChoice(savedPulse);
    }
  } catch (_) {}

  if (pulseYes) {
    pulseYes.addEventListener("click", function () {
      try {
        localStorage.setItem("cairn-pro-pulse", "yes");
      } catch (_) {}
      showPulseChoice("yes");
    });
  }

  if (pulseFree) {
    pulseFree.addEventListener("click", function () {
      try {
        localStorage.setItem("cairn-pro-pulse", "free");
      } catch (_) {}
      showPulseChoice("free");
    });
  }

  /* Wire any generic GitHub Issues anchors */
  document.querySelectorAll("[data-cairn-issues]").forEach(function (el) {
    el.setAttribute("href", issuesUrl);
  });
})();
