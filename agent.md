# 🤖 Agent Documentation: PocketResume Architecture

This document serves as a technical deep-dive for AI agents and developers working on the PocketResume codebase. It outlines the internal state flow, method signatures, and styling logic.

---

## 🏗️ State Flow & Data Management

The application uses a "Single Source of Truth" pattern. All resume content and layout settings reside in a centralized `data` object managed by the `useResumeData` hook.

### `useResumeData.js`
This hook is responsible for the core CRUD operations.
-   **`data`**: The master state object.
-   **`handleChange(path, value)`**: Updates a specific top-level or nested field.
-   **`handleArrayChange(sectionId, itemId, field, value)`**: Specialized updater for array items (e.g., job descriptions).
-   **`addItem(sectionId)`**: Pushes a new empty object into a section's list.
-   **`deleteItem(sectionId, itemId)`**: Removes an item from a section.

### Persistence
Persistence is handled via a `useEffect` in `useResumeData` that stringifies the `data` object and saves it to `localStorage` under the key `pocket-resume-data`.

---

## 🛠️ Layout & Logic Hooks

### `useLayoutManager.js`
Manages the visual ordering and visibility of sections.
-   **`layout`**: An array of section IDs (e.g., `['summary', 'experience', 'skills']`).
-   **`handleDrop(e, targetIndex)`**: Implements the native Drag & Drop logic to reorder the `layout` array.
-   **`toggleMinimize(sectionId)`**: Controls the collapsed state of sections in the editor to reduce visual clutter.
-   **`insertPageBreak(index)`**: Injects a special `pageBreak` object into the layout which triggers `break-before: page` in CSS.

### `utils/hooks.js`
-   **`usePWA`**: Handles the installation prompt. It includes a **3-day persistence cooldown** (using `localStorage`) to prevent nagging the user too frequently.
-   **`useSwipe`**: Enables horizontal swiping between resume templates, particularly useful for mobile navigation.
-   **`useScale`**: Dynamically calculates the `transform: scale()` value and viewport height to ensure the resume remains fully visible on mobile screens.

### `useSettings.js`
Handles the visual environment of the resume.
-   **`fontTheme`**: Manages the mapping between internal theme names and Google Font families.
-   **`fontSize`**: A base multiplier used to scale all typography proportionally.
-   **`theme`**: Controls the color palette (e.g., "Slate", "Sunset").

---

## 🎨 Styling System

The project uses a modular CSS approach located in `/src/styles`.

### Key CSS Files
-   **`variables.css`**: Defines CSS variables for themes. All components MUST use these variables instead of hardcoded hex values.
-   **`resume-core.css`**: Contains the layout engine for the resume container. It handles the `A4` aspect ratio and centering logic.
-   **`print.css`**:
    -   Forces `isEditMode` to hidden.
    -   Sets `@page` margins.
    -   Ensures background graphics are printed using `-webkit-print-color-adjust: exact`.

### Mobile Auto-Scaling
Mobile responsiveness is achieved via `transform: scale()` instead of standard media queries. This ensures that the resume looks *exactly* like the print version on a small screen. The `useScale` hook calculates the ratio between the window width and the fixed 800px width of the resume.

---

## 🧩 Component Breakdown

### `SectionRenderer.jsx`
The "Controller" for all resume sections. It handles:
-   Drag-and-drop event listeners.
-   Rendering section headers with "Delete" and "Minimize" controls.
-   Passing data-specific handlers to child sections.

### `EditableText.jsx`
A context-aware text component.
-   **In Edit Mode:** Renders as a `textarea` or `input`.
-   **In Preview Mode:** Renders as a `span` or `p`.
-   **Feature:** Automatically sanitizes and parses basic Markdown (bolding).

---

## ⚠️ Common Pitfalls

1.  **Ref Management:** Templates use `resumeRefs` to measure the height of the content for auto-scaling. If adding a new template, ensure the root element is assigned to a ref.
2.  **CSS Variable Overrides:** When creating new themes, ensure all variables in `variables.css` are accounted for to prevent invisible text or broken contrasts.
3.  **Local Storage Size:** Keep images (if any) as URLs or small base64 strings to avoid exceeding the 5MB `localStorage` limit.
