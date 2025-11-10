# Focus Extension MV3 Upgrade

This repository tracks the work required to upgrade the Focus browser extension to the MV# architecture.

The extension connects to the Focus macOS app via a websocket connection, blocks distracting sites, and now prompts you when a Focus break ends so you can leave the active site automatically after 60 seconds if you do nothing.

## Getting Started

1. Create a working `manifest.json` from `manifest.template.jsonc` (see **Manifest & RSA Key** below for details).
2. Load the extension into your browser's developer tools.
   - Chrome: open `chrome://extensions`, enable Developer Mode, click **Load unpacked**, and select this directory.
   - Firefox: open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on...**, and choose any file inside this directory.
3. Ensure the Focus macOS app is running so the websocket connection can be established.

## Manifest & RSA Key

`manifest.json` is intentionally ignored by git. Create it for your local environment by copying the template and adjusting any values (notably the `key` field) before loading the extension:

```sh
cp manifest.template.jsonc manifest.json
```

If you need to generate a new RSA key pair for Chrome, create a private key and derive the base64-encoded public key for the manifest:

```sh
# Generate a private key saved as key.pem
openssl genrsa -out key.pem 2048

# Export the public key, then copy the output into the manifest "key" field
openssl rsa -in key.pem -pubout -outform DER | openssl base64 -A
```

Keep `key.pem` private and do not commit it (the `.gitignore` already excludes `*.pem`).

## Key Files

- `focus.js`: background script that coordinates tab processing and break prompts.
- `focus-connection.js`: handles the websocket bridge to the Focus macOS app.
- `break-ended.html` / `break-ended.js`: popup shown when a Focus break ends with a 60-second auto-leave countdown.

## Notes

- The extension expects the Focus app to expose the local websocket defined in `config.js`.
- The MV# architecture upgrade maintains compatibility with both Chrome and Firefox runtimes.
