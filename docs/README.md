# Fairdien website

A responsive, monochrome website for the Fairdien Chrome extension. The design direction follows the supplied `docs.zip` reference: editorial typography, generous spacing, thin rules, restrained neutral surfaces, a browser-extension preview, light/dark/system themes, and subtle motion.

## Files

| Path | Purpose |
|---|---|
| `index.html` | Single-page product website with overview, features, workflow, privacy, installation instructions, FAQ, and project links. |
| `styles.css` | Responsive layout, monochrome palette, theme tokens, extension preview, and reduced-motion styling. |
| `script.js` | System/Light/Dark theme cycling and persistence, clone-command copy button, reveal-on-scroll behavior, and current-year text. |
| `assets/logo.png` | Fairdien extension icon used as the site mark and favicon. |

## Preview locally

Open `index.html` in a browser, or serve the `docs/` directory with any static web server. The site has no build step and no third-party runtime dependencies.

## Publish with GitHub Pages

The website files are in the repository's `docs/` directory. In the GitHub repository settings, configure GitHub Pages to deploy from the `main` branch and the `/docs` folder, assuming that is the desired publishing setup.

## Repository and install command

The installation section uses the project repository URL supplied for Fairdien:

```bash
git clone https://github.com/darshseraphic/Fairdien.git
```

Fairdien is not currently listed in the Chrome Web Store. The site explains how to load the extension unpacked using Chrome's Developer mode.

## Content notes

The product descriptions and permission explanations were adapted from the current Fairdien extension README and Manifest V3 file. Reminder delivery depends on Chrome running and operating-system notification settings. Task data and appearance preference are stored using `chrome.storage.local`; the extension does not request host permissions.
