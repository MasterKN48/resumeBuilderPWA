# 📄 PocketResume Builder PWA

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://masterkn48.github.io/resumeBuilderPWA/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://masterkn48.github.io/resumeBuilderPWA/)

PocketResume is a modern, interactive resume builder designed for speed, flexibility, and professional results. It features a live side-by-side preview, multiple templates, and flawless PDF export capabilities, all packaged as a lightweight PWA.

[**🌐 Launch App**](https://masterkn48.github.io/resumeBuilderPWA/)

## 📸 Screenshots

<p align="center">
  <img src="public/resumeView.png" height="250" width="32%" alt="Resume View" />
  <img src="public/template2.png" height="250" width="32%" alt="Modern Template" />
  <img src="public/editorView.png" height="250" width="32%" alt="Editor View" />
</p>

---

## 🏗️ Project Architecture

The project is built using **Preact** for high performance and a small bundle size. It follows a modular architecture where data management, layout logic, and UI components are strictly separated.

### Core Philosophy

1.  **Data-Driven UI:** The entire resume is represented by a single JSON object.
2.  **On-Device AI:** All AI features (parsing, chat) run locally via WebGPU/Transformers.js for total privacy.
3.  **Style Isolation:** Modular CSS ensures that templates can coexist without style leakage.

---

## ✨ Features

- **AI Career Assistant:** On-device WebGPU-powered AI chat for real-time resume optimization and career advice.
- **AI Resume Parsing:** Extract data directly from existing PDF resumes using semantic AI analysis (no server-side processing).
- **PWA & Offline:** Works without an internet connection and can be installed as a native app.
- **Live Templates:** Instantly switch between "Classic" and "Modern" layouts.
- **Interactive Drag & Drop:** Rearrange sections on the fly using native HTML5 drag events.
- **Smart Content Editing:** Markdown-style bolding support and automatic field hiding for empty data.
- **Dynamic Scaling:** Mobile-first design that auto-scales the resume to fit any screen size.
- **Privacy First:** All data is stored locally in your browser's `localStorage`. No accounts required.

---

## 📂 File Structure & Details

### `/src`

- **`App.jsx`**: The main entry point. It orchestrates hooks and renders the high-level layout.
- **`/components/AI`**:
  - **`AIContainer.jsx`**: Orchestrates state and messages between the UI and the AI Worker.
  - **`aiWorker.js`**: Web Worker handling heavy AI inference off-main-thread.
- **`/hooks`**:
  - **`useResumeData.js`**: Manages the main state, local storage persistence, and data updates.
  - **`useSettings.js`**: Handles theme, font sizing, and template switching.
  - **`useLayoutManager.js`**: Manages section ordering, visibility, and page breaks.
- **`/styles`**:
  - **`variables.css`**: Centralized design tokens (colors, spacing, shadows).
  - **`print.css`**: Specialized media queries for pixel-perfect PDF export.
  - **`ai-chatbot.css`**: Custom animations and responsive layouts for the AI interface.
- **`/utils`**:
  - **`resumeParser.js`**: Logic for AI-powered resume extraction.
  - **`pdfParser.js`**: Client-side PDF text extraction engine.

---

## 🛠️ Key Methods & Logic

### Data Persistence

Data is automatically synced to `localStorage` on every change via `useResumeData`.

### Print Logic (`handlePrint`)

Disables Edit Mode, applies specialized scaling for mobile, and injects a `mobile-print` class for pixel-perfect PDF generation.

---

## 🚀 Development

This project uses `bun` as its primary package manager and `vite` for building.

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build
```

## 📄 Best Results for Printing

1.  **Destination:** Save as PDF
2.  **Margins:** Set to **Default** (The app handles its own 15mm margins).
3.  **Options:** Ensure **Background Graphics** is **checked**.

---

Developed with ❤️ by [MasterKN48](https://github.com/MasterKN48)
