# Focus Extension MV# Upgrade

This repository tracks the work required to upgrade the Focus browser extension to the MV# architecture.

The extension connects to the Focus macOS app via a websocket connection, blocks distracting sites, and now prompts you when a Focus break ends so you can leave the active site automatically after 60 seconds if you do nothing.

## Getting Started

1. Load the extension into your browser's developer tools.
   - Chrome: open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, and select this directory.
   - Firefox: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on...**, and choose any file inside this directory.
2. Ensure the Focus macOS app is running so the websocket connection can be established.

## Key Files

- `focus.js`: background script that coordinates tab processing and break prompts.
- `focus-connection.js`: handles the websocket bridge to the Focus macOS app.
- `break-ended.html` / `break-ended.js`: popup shown when a Focus break ends with a 60-second auto-leave countdown.

## Notes

- The extension expects the Focus app to expose the local websocket defined in `config.js`.
- The MV# architecture upgrade maintains compatibility with both Chrome and Firefox runtimes.
