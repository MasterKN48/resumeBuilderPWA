# 🤖 Agent Documentation: PocketResume Architecture

This document serves as a technical deep-dive for AI agents and developers working on the PocketResume codebase. It outlines the internal state flow, method signatures, and styling logic.

---

## 🏗️ State Flow & Data Management

The application uses a "Single Source of Truth" pattern. All resume content and layout settings reside in a centralized `data` object managed by the `useResumeData` hook.

### `useResumeData.js`
This hook is responsible for core CRUD operations.
-   **`data`**: The master state object.
-   **`handleChange(path, value)`**: Updates a specific top-level or nested field.
-   **`setData(newData)`**: Bulk updates the entire resume state (used during AI imports).

---

## 🧠 AI Infrastructure (On-Device)

PocketResume runs Large Language Models directly on the client's GPU using WebGPU.

### Web Worker Engine (`aiWorker.js`)
To maintain 60FPS UI performance, all inference is offloaded to a Web Worker.
-   **Library**: `@huggingface/transformers` (v4.2.0).
-   **Quantization**: `q4f16` (4-bit weights) for minimal VRAM usage.
-   **Context Management**: Implements a summarization loop every 3 messages to stay within the model's context window.

### AI Parsing (`resumeParser.js`)
-   **Process**: PDF (Blob) -> `pdf.js` (Raw Text) -> LLM (Extraction) -> JSON Schema.
-   **Prompting**: Uses a specialized system prompt in `constants/prompts.js` to enforce strict JSON output.

---

## 🛠️ Layout & Logic Hooks

### `useLayoutManager.js`
Manages the visual ordering and visibility of sections.
-   **`layout`**: An array of section IDs (e.g., `['summary', 'experience', 'skills']`).
-   **`insertPageBreak(index)`**: Injects a special `pageBreak` object to trigger CSS breaks.

### `utils/hooks.js`
-   **`usePWA`**: Handles the installation prompt with a 3-day cooldown.
-   **`useScale`**: Dynamically calculates `transform: scale()` for mobile responsiveness.

---

## 🎨 Styling System

### Mobile AI UI (`ai-chatbot.css`)
-   **Positioning**: Uses `fixed` positioning with `bottom: 10.5rem` on mobile to avoid overlapping the floating navigation bar.
-   **Desktop Scaling**: Uses JavaScript-injected width only on screens `> 640px` to preserve CSS-driven responsiveness on mobile.

### Print Engine (`print.css`)
-   **Isolation**: All AI components and editing controls use the `.hide-print` class to ensure zero leakage into the final PDF.
-   **Scaling**: The `handlePrint` function in `App.jsx` temporarily adds a `.mobile-print` class to handle aspect-ratio normalization on mobile browsers.

---

## ⚠️ Agent Guidelines

1.  **Strict JSON**: When modifying the AI's response logic, ensure it adheres to the `resumeData.js` schema.
2.  **Web Worker Imports**: Always use ESM-compatible worker imports with `type: "module"`. For `@huggingface/transformers`, use the CDN URL in the worker for maximum portability and minimal build overhead.
3.  **Vite Config**: Ensure `worker: { format: "es" }` is set in `vite.config.js` to support top-level imports in workers.
