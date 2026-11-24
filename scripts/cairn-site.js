/* ==========================================================================
   Cairn Public Site — Interactive Trailhead Controls & 1-Click Pulse Capture
   Direct Chrome Web Store links · Accessible roving tabindex · Zero-CLS swaps
   ========================================================================== */
(function () {
  "use strict";

  var links = window.CAIRN_LINKS || {};
  var siteUrl = links.siteUrl || window.location.href.split("#")[0];
  var storeUrl = (
    links.chromeWebStoreUrl ||
    "https://chromewebstore.google.com/detail/cairn-%E2%80%94-intentional-viewi/faebackbnaagohmbebibnancofpgadfm"
  ).trim();
  var whatsappChannelUrl = (links.whatsappChannelUrl || "").trim();
  var issuesUrl = links.githubIssuesUrl || "https://github.com/mohdashraf010897/cairn-public/issues";

  /* First-party Cloudflare D1 Worker (disabled on localhost unless explicitly overridden for tests) */
  var pulseBase = String(
    window.CAIRN_PULSE_API_OVERRIDE || links.pulseApiBaseUrl || ""
  ).replace(/\/+$/, "");
  var isLocalHost =
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "localhost" ||
    window.location.protocol === "file:";
  var canCallPulseApi =
    Boolean(pulseBase) && (!isLocalHost || Boolean(window.CAIRN_PULSE_API_OVERRIDE));

  function detectRefSource() {
    try {
      var params = new URLSearchParams(window.location.search || "");
      var utm = params.get("utm_source") || params.get("ref") || params.get("source");
      if (utm) return utm.slice(0, 64);
      if (document.referrer) {
        var refHost = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (refHost && refHost !== window.location.hostname) {
          return refHost.slice(0, 64);
        }
      }
    } catch (_) {}
    return "direct";
  }

  var refSource = detectRefSource();

  function getDeviceKind() {
    var ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(ua) ? "mobile" : "desktop";
  }

  function trackFunnel(eventType, buttonSlot) {
    if (!canCallPulseApi) return;
    var payload = JSON.stringify({
      event_type: eventType,
      button_slot: buttonSlot || "unknown",
      ref_source: refSource,
      device_kind: getDeviceKind()
    });
    var endpoint = pulseBase + "/api/funnel";
    try {
      if (navigator.sendBeacon) {
        var sent = navigator.sendBeacon(endpoint, payload);
        if (sent) return;
      }
    } catch (_) {}
    try {
      fetch(endpoint, {
        method: "POST",
        body: payload,
        keepalive: true
      }).catch(function () {});
    } catch (_) {}
  }

  /* Record one aggregate landing page view per browser tab session */
  if (canCallPulseApi && document.getElementById("preview")) {
    try {
      if (!sessionStorage.getItem("cairn-pv-v1")) {
        sessionStorage.setItem("cairn-pv-v1", "1");
        trackFunnel("page_view", "landing");
      }
    } catch (_) {
      trackFunnel("page_view", "landing");
    }
  }

  function buildStoreUrl(slot) {
    if (!storeUrl) return "#get-cairn";
    try {
      var u = new URL(storeUrl);
      u.searchParams.set("utm_source", "cairn-site");
      if (slot) u.searchParams.set("utm_medium", slot);
      if (refSource && refSource !== "direct") {
        u.searchParams.set("utm_campaign", refSource);
      }
      return u.toString();
    } catch (_) {
      return storeUrl;
    }
  }

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

  /* ── 2. Direct Chrome Web Store & WhatsApp Store Links ────────────────── */
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

  /* Wire every install CTA straight to the live Chrome Web Store listing */
  document.querySelectorAll("[data-cairn-install]").forEach(function (el) {
    var slot = el.getAttribute("data-cairn-install") || "cta";
    if (storeUrl) {
      el.setAttribute("href", buildStoreUrl(slot));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
    el.addEventListener("click", function () {
      trackFunnel("cws_click", slot);
    });
  });

  var cwsStatusBadge = document.getElementById("cws-status-text");
  if (cwsStatusBadge && storeUrl) {
    cwsStatusBadge.textContent = "Live on the Chrome Web Store · v1.2.2";
  }

  /* Wire WhatsApp save-to-self & share links with the direct Chrome Web Store URL */
  var saveMsg =
    links.whatsappDesktopSaveText ||
    "Install Cairn on desktop Chrome (intentional YouTube — hides Shorts & rabbit holes, 100% local): " +
      storeUrl;
  var shareMsg =
    links.whatsappShareText ||
    "Using Cairn on Chrome to open YouTube for one thing and leave when done: " + storeUrl;
  var demoShareMsg =
    links.whatsappDemoShareText ||
    "22-sec demo of Cairn for Chrome — install free: " +
      storeUrl +
      "\nWatch 22s walkthrough: " +
      siteUrl +
      "#walkthrough";

  document.querySelectorAll("[data-wa-save]").forEach(function (el) {
    var slot = el.getAttribute("data-wa-save") || "wa_save";
    el.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(saveMsg));
    el.addEventListener("click", function () {
      trackFunnel("wa_save_self", slot);
    });
  });

  document.querySelectorAll("[data-wa-share]").forEach(function (el) {
    var slot = el.getAttribute("data-wa-share") || "wa_share";
    el.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(shareMsg));
    el.addEventListener("click", function () {
      trackFunnel("wa_share_friend", slot);
    });
  });

  document.querySelectorAll("[data-wa-share-demo]").forEach(function (el) {
    var slot = el.getAttribute("data-wa-share-demo") || "wa_demo";
    el.setAttribute("href", "https://wa.me/?text=" + encodeURIComponent(demoShareMsg));
    el.addEventListener("click", function () {
      trackFunnel("wa_share_demo", slot);
    });
  });

  document.querySelectorAll("[data-email-self]").forEach(function (el) {
    var subj = "Install Cairn on Chrome (Direct Chrome Web Store link)";
    var body =
      "Open this on your laptop in Chrome to install Cairn (Intentional Viewing for YouTube):\n\n" +
      (storeUrl || siteUrl);
    el.setAttribute(
      "href",
      "mailto:?subject=" + encodeURIComponent(subj) + "&body=" + encodeURIComponent(body)
    );
  });

  /* Optional Official WhatsApp Broadcast Channel button (unhides automatically when URL is set) */
  var channelBtn = document.getElementById("wa-channel-btn");
  if (channelBtn) {
    if (whatsappChannelUrl) {
      channelBtn.hidden = false;
      channelBtn.setAttribute("href", whatsappChannelUrl);
      channelBtn.addEventListener("click", function () {
        trackFunnel("wa_channel_click", "whatsapp_card");
      });
    } else {
      channelBtn.hidden = true;
    }
  }

  /* Copy Chrome Web Store link buttons */
  var copyToast = document.getElementById("copy-toast");
  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    var slot = btn.getAttribute("data-copy-link") || "copy";
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
      trackFunnel("copy_store_link", slot);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(targetUrl)
          .then(function () {
            announceCopy("Copied Store Link ✓", "Copied Chrome Web Store link!");
          })
          .catch(function () {
            window.prompt("Copy Cairn Chrome Web Store link:", targetUrl);
            announceCopy("Store Link Shown", "Chrome Web Store link: " + targetUrl);
          });
      } else {
        window.prompt("Copy Cairn Chrome Web Store link:", targetUrl);
        announceCopy("Store Link Shown", "Chrome Web Store link: " + targetUrl);
      }
    });
  });

  /* ── 3. Interactive Zero-CLS Hero Stage (4 Scenarios x Cairn ON/OFF) ──── */
  var scenarioTabs = Array.prototype.slice.call(
    document.querySelectorAll("[data-scenario-tab]")
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
      if (!promoVideo.muted) {
        trackFunnel("video_unmute", "walkthrough");
        if (promoVideo.paused) {
          promoVideo.play().catch(function () {});
        }
      }
      muteToggle.setAttribute("aria-pressed", promoVideo.muted ? "false" : "true");
      muteToggle.textContent = promoVideo.muted ? "Unmute tactile sound" : "Mute sound";
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

  var simStartWait = document.getElementById("sim-start-wait");
  var simLevel2Msg = document.getElementById("sim-level2-feedback");
  if (simStartWait && simLevel2Msg) {
    simStartWait.addEventListener("click", function () {
      if (countdownTimer) clearInterval(countdownTimer);
      var left = 5;
      simLevel2Msg.textContent =
        "Breathing pause: " + left + "s remaining before Turn Off unlocks...";
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

  /* ── 6. 1-Click Chrome Built-in AI Pulse (Cloudflare D1, Zero Extra Hop) ─ */
  var pulseYes = document.getElementById("pulse-yes");
  var pulseFree = document.getElementById("pulse-free");
  var pulseYesCount = document.getElementById("pulse-yes-count");
  var pulseFreeCount = document.getElementById("pulse-free-count");
  var pulseNoteForm = document.getElementById("pulse-note-form");
  var pulseNoteInput = document.getElementById("pulse-note-input");
  var pulseFeedback = document.getElementById("pulse-feedback");

  function getOrCreateVoterId() {
    var key = "cairn-pulse-voter-v1";
    try {
      var existing = localStorage.getItem(key);
      if (existing && existing.length >= 8) return existing;
      var created =
        window.crypto && window.crypto.randomUUID
          ? window.crypto.randomUUID()
          : "cairn-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
      localStorage.setItem(key, created);
      return created;
    } catch (_) {
      return "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    }
  }

  var selectedPulseChoice = null;

  function renderPulseSelection(choice) {
    selectedPulseChoice = choice;
    if (pulseYes) {
      var isYes = choice === "yes";
      pulseYes.classList.toggle("is-selected", isYes);
      pulseYes.setAttribute("aria-pressed", isYes ? "true" : "false");
    }
    if (pulseFree) {
      var isNo = choice === "no";
      pulseFree.classList.toggle("is-selected", isNo);
      pulseFree.setAttribute("aria-pressed", isNo ? "true" : "false");
    }
  }

  function renderPulseCounts(counts) {
    if (!counts) return;
    var y = Number(counts.yes || 0);
    var n = Number(counts.no || 0);
    if (pulseYesCount) {
      pulseYesCount.textContent = y > 0 ? String(y) : "Vote";
    }
    if (pulseFreeCount) {
      pulseFreeCount.textContent = n > 0 ? String(n) : "Vote";
    }
  }

  function setPulseStatus(msg, state) {
    if (!pulseFeedback) return;
    pulseFeedback.textContent = msg;
    pulseFeedback.classList.toggle("is-confirmed", state === "ok");
    pulseFeedback.classList.toggle("is-error", state === "err");
  }

  function submitPulseToEdge(choice, wishText) {
    try {
      localStorage.setItem("cairn-pro-pulse", choice);
    } catch (_) {}
    renderPulseSelection(choice);

    if (!canCallPulseApi) {
      setPulseStatus(
        choice === "yes"
          ? "Vote recorded! Optional: add what video preview would help most above."
          : "Vote recorded — Cairn's core blocker & Workday Lock stay $0 forever.",
        "ok"
      );
      return;
    }

    setPulseStatus("Saving your response...", "");
    var payload = {
      voterId: getOrCreateVoterId(),
      choice: choice,
      wish: wishText || "",
      ref_source: refSource
    };

    fetch(pulseBase + "/api/pro-pulse", {
      method: "POST",
      body: JSON.stringify(payload),
      keepalive: true
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        renderPulseCounts(data);
        if (wishText) {
          setPulseStatus("Saved your vote + feature note directly to our roadmap!", "ok");
        } else if (choice === "yes") {
          setPulseStatus(
            "Counted! Optional: tell us what video preview would help most above.",
            "ok"
          );
        } else {
          setPulseStatus(
            "Counted — Cairn's core blocker & Workday Lock stay $0 forever.",
            "ok"
          );
        }
      })
      .catch(function () {
        setPulseStatus("Saved on this browser (offline right now).", "ok");
      });
  }

  if (pulseYes || pulseFree) {
    try {
      var prevChoice = localStorage.getItem("cairn-pro-pulse");
      if (prevChoice === "free") prevChoice = "no";
      if (prevChoice === "yes" || prevChoice === "no") {
        renderPulseSelection(prevChoice);
      }
    } catch (_) {}

    if (canCallPulseApi) {
      fetch(pulseBase + "/api/pro-pulse")
        .then(function (r) {
          return r.json();
        })
        .then(function (data) {
          renderPulseCounts(data);
        })
        .catch(function () {});
    }

    if (pulseYes) {
      pulseYes.addEventListener("click", function () {
        submitPulseToEdge(
          "yes",
          pulseNoteInput ? pulseNoteInput.value.trim() : ""
        );
      });
    }

    if (pulseFree) {
      pulseFree.addEventListener("click", function () {
        submitPulseToEdge(
          "no",
          pulseNoteInput ? pulseNoteInput.value.trim() : ""
        );
      });
    }

    if (pulseNoteForm && pulseNoteInput) {
      pulseNoteForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var note = pulseNoteInput.value.trim();
        if (!note) {
          pulseNoteInput.focus();
          setPulseStatus("Type a short feature wish above, or click Yes / Free to vote.", "");
          return;
        }
        var activeChoice = selectedPulseChoice || "yes";
        submitPulseToEdge(activeChoice, note);
        pulseNoteInput.value = "";
      });
    }
  }

  /* ── 7. 1-Step WhatsApp / Email Release Drops Signup (Cloudflare D1) ──── */
  var subForm = document.getElementById("wa-subscribe-form");
  var subInput = document.getElementById("wa-contact-input");
  var subFeedback = document.getElementById("wa-subscribe-feedback");

  function setSubStatus(msg, state) {
    if (!subFeedback) return;
    subFeedback.textContent = msg;
    subFeedback.classList.toggle("is-confirmed", state === "ok");
    subFeedback.classList.toggle("is-error", state === "err");
  }

  if (subForm && subInput) {
    subForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var raw = subInput.value.trim();
      var isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(raw);
      var digits = raw.replace(/[^\d]/g, "");
      var isPhone = !isEmail && digits.length >= 7 && digits.length <= 16;

      if (!isEmail && !isPhone) {
        subInput.focus();
        setSubStatus(
          "Enter a WhatsApp number (with country code, e.g. +1...) or email.",
          "err"
        );
        return;
      }

      if (!canCallPulseApi) {
        subInput.value = "";
        setSubStatus(
          isEmail
            ? "You're on the list! We'll email you on major Cairn drops."
            : "You're on the list! We'll ping your WhatsApp on major drops.",
          "ok"
        );
        return;
      }

      setSubStatus("Saving...", "");
      fetch(pulseBase + "/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ contact: raw, ref_source: refSource }),
        keepalive: true
      })
        .then(function (r) {
          return r.json().then(function (d) {
            return { ok: r.ok, data: d };
          });
        })
        .then(function (res) {
          if (!res.ok) {
            setSubStatus(res.data.error || "Please check your WhatsApp number or email.", "err");
            return;
          }
          subInput.value = "";
          setSubStatus(
            (res.data.channel_type || res.data.channel) === "email"
              ? "You're on the list! We'll email you when major updates ship."
              : "You're on the list! We'll ping your WhatsApp on major drops.",
            "ok"
          );
        })
        .catch(function () {
          setSubStatus("Could not reach server — please try again in a moment.", "err");
        });
    });
  }

  /* Wire any generic GitHub Issues anchors */
  document.querySelectorAll("[data-cairn-issues]").forEach(function (el) {
    el.setAttribute("href", issuesUrl);
  });
})();
