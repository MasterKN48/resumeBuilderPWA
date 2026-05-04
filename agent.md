# Agent Instructions: Resume Builder PWA

This document provides context and guidelines for AI agents working on this codebase.

## Tech Stack
- **Core:** Preact (React-compatible)
- **State Management:** Hooks (`useState`, `useEffect`) in `App.jsx`
- **Styling:** Vanilla CSS in `style.css`
- **Icons:** `lucide-preact`
- **Build Tool:** Vite
- **Package Manager:** Bun

## Key Components & Architecture
- **`App.jsx`:** The main entry point. Handles all data management, section rendering, and custom font injection.
- **Data Model:** A centralized `data` object stored in `localStorage`. Includes a `layout` array that determines the order of sections.
- **EditableText:** A wrapper component that toggles between an `input`/`textarea` (Edit Mode) and a formatted `span`/`p` (Preview Mode).
- **Markdown Support:** A lightweight `parseMarkdown` function handles `**bolding**`.

## Styling Conventions
- **Glassmorphism:** The floating bottom toolbar uses a backdrop-filter blur and semi-transparent gradients.
- **Print Optimization:** 
  - Uses `@media print` with `@page` margins set to `15mm`.
  - Background graphics MUST be enabled in the print dialog for skill chips and accent colors.
  - The `.resume-container` horizontal padding ensures side margins even if the browser overrides `@page`.

## Common Tasks & "Gotchas"
- **Custom Fonts:** Users can provide a Google Font name or a full CSS URL. The `useEffect` in `App.jsx` dynamically injects the `<link>` tag.
- **Page Breaks:** Implemented as a specific section type (`pageBreak`) that triggers `break-before: page` in CSS.
- **Conditional Rendering:** Fields like LinkedIn/Portfolio are hidden in Preview/Print if the state value is empty.

## Print Calibration
When modifying layout or spacing, always verify the print layout. Use the `Print to PDF` function and ensure:
1. No content is clipped at page boundaries.
2. Background colors (like skill chips) are visible.
3. The background color matches `var(--bg-color)` across multiple pages.
