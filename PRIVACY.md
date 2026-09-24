# Cairn Privacy Policy

Last updated: September 24, 2026

Cairn operates no servers and makes no analytics, crash-reporting, telemetry, or external API requests. It does not send viewing activity, intentions, or video titles to Cairn or another service. Chrome may synchronize settings through your Google account if browser sync is enabled, as described below.

## Data handled

Cairn handles the following data only to provide its visible intentional-viewing features:

- **Website content:** YouTube video titles and channel names are read locally to produce deterministic content-quality signals.
- **Web browsing activity:** time spent on YouTube and the number of focus controls applied are stored locally for the session timer and weekly report.
- **User-provided text:** viewing intentions, a custom bypass phrase, whitelist entries, schedules, and other settings are stored through Chrome's storage APIs.
- **Authentication information:** if you set a Lock PIN, Cairn stores its SHA-256 hash, not the PIN itself, in Chrome settings storage. The hash may sync with your settings if Chrome Sync is enabled.

Cairn does not sell this data, use it for advertising, or allow humans to read it. Cairn does not transfer data to third parties; Chrome may synchronize settings through your Google account if browser sync is enabled.

## Storage

- **`chrome.storage.sync`** stores settings, preferences, any custom bypass phrase, and the optional Lock PIN hash. If Chrome Sync is enabled, Chrome may synchronize these settings through your Google account under [Google's privacy policy](https://policies.google.com/privacy). Cairn does not operate the sync service.
- **`chrome.storage.local`** stores viewing statistics, typed intentions, the local content-classification cache, and break-glass count. This data stays on this device.

Settings can be exported as JSON or reset from the extension's settings page.

## Permissions

- **storage** saves settings and local viewing statistics.
- **alarms** supports session nudges, scheduled Focus Mode, pauses, and Lock expiry.

Cairn runs only on desktop `youtube.com` pages. It does not request browsing-history access or access unrelated sites.

## Content signals

Video titles are evaluated locally with deterministic rules. Titles, classifications, and viewing history are not sent to an external service.

## Contact

For privacy questions, use the Cairn listing's Support hub after publication,
or [open a support issue](https://github.com/mohdashraf010897/cairn-public/issues)
(GitHub sign-in required to post).

## Limited Use

Cairn's use of data complies with the Chrome Web Store User Data Policy, including
the Limited Use requirements. Data is used only to provide or improve Cairn's
single user-facing purpose, is not transferred except through optional
Chrome-managed settings sync, is not used for advertising, and is not exposed to
human review.
