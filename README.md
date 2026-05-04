# 📄 ProResume Builder PWA

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://masterkn48.github.io/resumeBuilderPWA/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://masterkn48.github.io/resumeBuilderPWA/)

A modern, highly customizable, and offline-capable interactive resume builder built with Preact and Vite. Build your professional resume with a live preview, drag-and-drop sections, and flawless PDF export.

[**🌐 Launch App**](https://masterkn48.github.io/resumeBuilderPWA/)

## 📸 Screenshots

<p align="center">
  <img src="public/1.jpg" width="45%" alt="Editor View" />
  <img src="public/2.jpg" width="45%" alt="Print Preview" />
</p>

<p align="center">
  <img src="public/screenshot.png" width="100%" alt="Desktop Preview" />
</p>

## ✨ Features

- **Progressive Web App (PWA):** Installs seamlessly on your local device and works offline.
- **Data Persistence:** All edits are automatically saved to your browser's local storage. You never lose your progress!
- **Dynamic Layout Engine:** Easily drag, drop, and rearrange entire resume sections (Experience, Education, Projects, Skills) to fit your narrative.
- **Page Breaks:** Insert custom page breaks anywhere in the layout to flawlessly split your resume across multiple pages when printing to PDF.
- **Markdown Highlighting:** Instantly bold keywords using lightweight Markdown-style syntax (`**highlight**`) directly in the editor.
- **Conditional Fields:** Smartly hide unused fields (like LinkedIn, Portfolio, or specific project links) simply by leaving them blank.
- **Typography Controls:** Scale the font sizes globally (Small, Medium, Large) right from the toolbar.
- **Print Fidelity:** Designed from the ground up to render a perfect 1:1 PDF layout via your browser's native `Print to PDF` function.

## Development

This project uses `bun` as its primary package manager.

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## Deployment to GitHub Pages

This repository is pre-configured to easily deploy to GitHub Pages.

1. Ensure the `base: './'` is set in your `vite.config.js`.
2. Run the deploy script:

```bash
bun run deploy
```

This will automatically build your application and push the compiled `dist` folder to the `gh-pages` branch, making it live on the web!

---

## Best Results for Printing

To get a perfect PDF export every time, follow these settings in your browser's print dialog:

1. **Destination:** Save as PDF
2. **Margins:** Set to **Default** or **None** (The app handles its own 15mm margins).
3. **Options:** Ensure **Background Graphics** is **checked** (important for accent colors and skill chips).
4. **Paper Size:** A4 or Letter (both are supported by the dynamic layout).
