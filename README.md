# 📄 PocketResume Builder PWA

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=github)](https://masterkn48.github.io/resumeBuilderPWA/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange?style=for-the-badge&logo=pwa)](https://masterkn48.github.io/resumeBuilderPWA/)

PocketResume is a modern, interactive resume builder designed for speed, flexibility, and professional results. It features a live side-by-side preview, multiple templates, and flawless PDF export capabilities, all packaged as a lightweight PWA.

[**🌐 Launch App**](https://masterkn48.github.io/resumeBuilderPWA/)

---

## 🏗️ Project Architecture

The project is built using **Preact** for high performance and a small bundle size. It follows a modular architecture where data management, layout logic, and UI components are strictly separated.

### Core Philosophy
1.  **Data-Driven UI:** The entire resume is represented by a single JSON object.
2.  **Hook-Based Logic:** All business logic (CRUD, Layout, PWA) is encapsulated in custom hooks.
3.  **Style Isolation:** Modular CSS ensures that templates can coexist without style leakage.

---

## 📂 File Structure & Details

### `/src`
The heart of the application.

-   **`App.jsx`**: The main entry point. It orchestrates the hooks and renders the high-level layout (FloatingBar, Viewport, Templates).
-   **`/components`**:
    -   **`SectionRenderer.jsx`**: A high-order component that wraps individual sections, providing drag-and-drop handles and editing controls.
    -   **`/sections`**: Individual resume modules (e.g., `ExperienceSection.jsx`, `SkillsSection.jsx`). Each section is designed to be standalone.
    -   **`/shared`**: Reusable UI elements like `FloatingBar.jsx`, `EditableText.jsx`, and `InstallBanner.jsx`.
    -   **`/templates`**: High-level layout wrappers (`ClassicTemplate.jsx`, `ModernTemplate.jsx`) that define the visual structure of the resume.
-   **`/hooks`**:
    -   **`useResumeData.js`**: Manages the main state, local storage persistence, and data updates.
    -   **`useSettings.js`**: Handles theme, font sizing, and template switching.
    -   **`useLayoutManager.js`**: Manages section ordering (drag-and-drop), visibility, and page breaks.
-   **`/styles`**:
    -   **`variables.css`**: Centralized design tokens (colors, spacing, shadows).
    -   **`resume-core.css`**: Shared styles for resume elements across all templates.
    -   **`print.css`**: Specialized media queries for pixel-perfect PDF export.
    -   **`edit-mode.css`**: Styles specifically for the interactive editor state.
-   **`/constants`**:
    -   **`resumeData.js`**: Defines the default schema and initial state for a new resume.

---

## ✨ Features

-   **PWA & Offline:** Works without an internet connection and can be installed as a native app on iOS, Android, and Desktop.
-   **Live Templates:** Instantly switch between "Classic" and "Modern" layouts with a swipe or keyboard shortcut.
-   **Interactive Drag & Drop:** Rearrange sections on the fly using native HTML5 drag events.
-   **Smart Content Editing:** Markdown-style bolding support and automatic field hiding for empty data.
-   **Dynamic Scaling:** Mobile-first design that auto-scales the resume to fit any screen size while maintaining layout integrity.
-   **Custom Typography:** Integration with Google Fonts for professional typefaces.
-   **Privacy First:** All data is stored locally in your browser's `localStorage`. No accounts or server-side storage required.

---

## 🛠️ Key Methods & Logic

### Data Persistence
Data is automatically synced to `localStorage` on every change via `useResumeData`. This ensures that work is never lost, even if the tab is closed.

### Print Logic (`handlePrint`)
The application uses a custom print handler that:
1.  Disables Edit Mode for a clean export.
2.  Applies specialized scaling for mobile devices to ensure the PDF remains A4/Letter size regardless of the viewport.
3.  Injects a `mobile-print` class to handle browser-specific print quirks.

### Layout Management
The `useLayoutManager` hook provides a `layout` array which is a list of section IDs. The `SectionRenderer` uses this array to determine the visual order of components, allowing for seamless reordering.

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
4.  **Paper Size:** A4 or Letter.

---

Developed with ❤️ by [MasterKN48](https://github.com/MasterKN48)
