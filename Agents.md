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

## 🧠 AI Infrastructure (On-Device & Hybrid)

PocketResume runs Large Language Models directly on the client's GPU using WebGPU, with a robust fallback system.

### Web Worker Engine (`aiWorker.js`)
To maintain 60FPS UI performance, all local inference is offloaded to a Web Worker.
-   **Library**: `@huggingface/transformers` (v4.2.0).
-   **Dual-Backend**: Implements a `try-catch` initialization loop. It attempts **WebGPU** (`q4f16`) first, and automatically falls back to **WASM** (`fp32`) if hardware acceleration is unavailable.
-   **Context Management**: Implements a summarization loop every 3 messages to stay within the model's context window.

### Hybrid Inference (`AIContainer.jsx`)
-   **Local Mode**: Uses the Web Worker for private, offline generation.
-   **Remote Mode**: Allows users to connect to OpenAI-compatible APIs. This serves as a stable alternative for low-end mobile devices that might struggle with local inference.

### Unified Configuration (`aiConfigManager.js`)
-   **Synchronization**: Ensures that the `localModelId`, `remoteAPIKey`, and `useRemote` toggle are synchronized between the chat assistant and the PDF resume parser.
-   **Storage Optimization**: By sharing the model configuration, the app prevents redundant downloads and ensures the parser uses the same model already cached by the chat assistant.

### AI Parsing (`resumeParser.js`)
-   **Process**: PDF (Blob) -> `pdf.js` (Raw Text) -> LLM (Extraction) -> JSON Schema.
-   **Dynamic Backend**: Automatically uses either the Local Worker or the Remote API based on the user's global AI settings.
-   **Prompting**: Uses a specialized system prompt in `constants/prompts.js` to enforce strict JSON output.

---

## 🛠️ Layout & Logic Hooks

### `App.jsx` Error Handling
-   **Global Monitoring**: Implements `window.onerror` and `unhandledrejection` listeners specifically tuned to detect OOM (Out of Memory) errors and GPU crashes on mobile, providing user-friendly alerts.

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

## 🤖 AI Assistant: Technical Deep-Dive

### 🛠️ Tool Calling Mechanism
The assistant uses a **Text-to-Action Bridge** instead of native JSON tool calling to maintain compatibility across all local and remote models.
- **Parsing**: `AIContainer.jsx` uses a regex-based parser to detect patterns like `[tool_name(param="value")]` or `[tool_name(param=value)]` in the LLM's text stream. It supports double quotes, single quotes, or unquoted values (useful for numbers).
- **Tools**:
    - `edit_field(path, value)`: Updates any field using dot-notation (e.g., `experience.0.title`).
    - `add_item(section)`: Appends a boilerplate object (with a new `uuid`) to list sections.
    - `delete_item(section, index)`: Removes an item from a specific array.
    - `move_section(oldIndex, newIndex)`: Reorders sections in the `layout` array.
    - `delete_section(index)`: Removes an entire section from the visible layout.
    - `print_resume()`: Triggers the browser's print dialog for PDF export.
    - `change_template(template)`: Switches between 'classic' and 'modern' styles.
    - `add_page_break(index)`: Inserts a manual page break after the section at the given index.
    - `delete_page_break(index)`: Removes a manual page break at the given index.
    - `set_font_style(fontName)`: Updates the Google Font for the document.
    - `set_font_size(size)`: Sets the font size preset ('small', 'medium', 'large').
    - `set_font_scale(scale)`: Adjusts the fine-grained font scaling factor.

### 📡 SSE Streaming & Buffering
To ensure smooth "cinematic" text delivery, the application implements a multi-layer streaming architecture:
1. **Raw SSE Parsing**: `aiUtils.js` implements a buffered SSE parser that handles partial JSON chunks and ensures complete messages are processed.
2. **UI Throttling**: `AIChatWindow.jsx` uses a `displayBuffer` to decouple the rapid incoming chunks from the rendering loop, preventing layout jitter.
3. **CSS Masking**: A percentage-based linear gradient mask is applied to the streaming text, creating a "fade-in" effect that moves as new text arrives.

### 📉 Data Minification
To stay within the context limits of small local models (like LFM-350M), the `minifyResumeData` utility (in `aiUtils.js`) strips unnecessary metadata:
- **Schema Mapping**: Maps complex internal objects to flat, readable versions for the LLM.
- **Layout Context**: Provides the current section order as an indexed list (e.g., `0: summary, 1: experience`) so the model can accurately use the `move_section` and `delete_section` tools.

---

## ⚠️ Agent Guidelines

1.  **Strict JSON**: When modifying the AI's response logic, ensure it adheres to the `resumeData.js` schema.
2.  **Web Worker Imports**: Always use ESM-compatible worker imports with `type: "module"`.
3.  **Path Notation**: Always use dot-notation for nested updates via the `edit_field` tool.
4.  **Minification Sync**: If you add new data fields to `resumeData.js`, you MUST update `minifyResumeData` in `aiUtils.js` to ensure the AI remains aware of the new state.
