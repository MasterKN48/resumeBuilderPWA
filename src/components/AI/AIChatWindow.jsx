import {
  X,
  Send,
  Download,
  Bot,
  Loader2,
  Settings,
  ChevronLeft,
  Trash2,
} from "lucide-preact";
import { useState, useRef, useEffect } from "preact/hooks";
import { formatMarkdown } from "../../utils/aiUtils";

export function AIChatWindow({
  onClose,
  status,
  downloadProgress,
  onDownload,
  messages,
  onSendMessage,
  isGenerating,
  apiConfig,
  setApiConfig,
  showToast,
}) {
  const [inputValue, setInputValue] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [storageSize, setStorageSize] = useState(null);
  const [tempModelId, setTempModelId] = useState(null);
  const [width, setWidth] = useState(400);
  const messagesEndRef = useRef(null);
  const isResizing = useRef(false);

  const updateStorageSize = async () => {
    try {
      const cacheNames = await caches.keys();
      let total = 0;
      for (const name of cacheNames) {
        if (name.includes("transformers-cache")) {
          const cache = await caches.open(name);
          const requests = await cache.keys();
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              total += blob.size;
            }
          }
        }
      }
      setStorageSize((total / (1024 * 1024)).toFixed(1) + " MB");
    } catch (e) {
      console.error("Error calculating storage:", e);
      setStorageSize("Unknown");
    }
  };

  useEffect(() => {
    if (showSettings) updateStorageSize();
  }, [showSettings]);

  const handleClearAICache = async () => {
    if (
      confirm(
        "Are you sure you want to delete the AI model cache? You will need to re-download the models to use Local AI again.",
      )
    ) {
      try {
        const cacheNames = await caches.keys();
        for (const name of cacheNames) {
          if (name.includes("transformers-cache")) {
            await caches.delete(name);
          }
        }
        showToast("AI Model cache cleared successfully.", "success");
        setTimeout(() => window.location.reload(), 1500);
      } catch (error) {
        console.error("Error clearing AI cache:", error);
        showToast(
          "Failed to clear AI cache. Please try browser settings.",
          "error",
        );
      }
    }
  };

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResizing);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ew-resize";
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = window.innerWidth - e.clientX - 20;
    if (newWidth >= 320 && newWidth <= 800) {
      setWidth(newWidth);
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResizing);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() && !isGenerating) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="ai-chat-window"
      style={{
        width:
          typeof window !== "undefined" && window.innerWidth > 640
            ? `${width}px`
            : undefined,
      }}
    >
      <div className="ai-chat-resizer" onMouseDown={startResizing}></div>
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          {showSettings ? (
            <button
              className="ai-back-button"
              onClick={() => setShowSettings(false)}
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div
              className={`ai-status-indicator ${status}`}
              title={`Status: ${status}`}
            ></div>
          )}
          <h3 className="ai-chat-header-title">
            {showSettings ? "AI Settings" : "Pocket AI"}
          </h3>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {!showSettings && (
            <button
              className="ai-settings-button"
              onClick={() => setShowSettings(true)}
            >
              <Settings size={20} />
            </button>
          )}
          <button className="ai-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="ai-chat-content">
        {showSettings ? (
          <div className="ai-settings-view">
            <div className="ai-setting-item">
              <label className="ai-setting-label">Inference Mode</label>
              <div className="ai-toggle-group">
                <button
                  className={`ai-toggle-btn ${!apiConfig.useRemote ? "active" : ""}`}
                  onClick={() => {
                    const newConfig = { ...apiConfig, useRemote: false };
                    setApiConfig(newConfig);
                    showToast("Switching to Local AI...", "info");
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                >
                  Local AI
                </button>
                <button
                  className={`ai-toggle-btn ${apiConfig.useRemote ? "active" : ""}`}
                  onClick={() => {
                    const newConfig = { ...apiConfig, useRemote: true };
                    setApiConfig(newConfig);
                    showToast("Switching to Remote API...", "info");
                    setTimeout(() => window.location.reload(), 1000);
                  }}
                >
                  Remote API
                </button>
              </div>
            </div>

            {apiConfig.useRemote && (
              <>
                <div className="ai-setting-item">
                  <label className="ai-setting-label">API Endpoint</label>
                  <input
                    type="text"
                    className="ai-setting-input"
                    value={apiConfig.url}
                    onInput={(e) =>
                      setApiConfig({ ...apiConfig, url: e.target.value })
                    }
                    placeholder="https://api.openai.com/v1/chat/completions"
                  />
                </div>
                <div className="ai-setting-item">
                  <label className="ai-setting-label">API Key</label>
                  <input
                    type="password"
                    className="ai-setting-input"
                    value={apiConfig.key}
                    onInput={(e) =>
                      setApiConfig({ ...apiConfig, key: e.target.value })
                    }
                    placeholder="sk-..."
                  />
                </div>
                <div className="ai-setting-item">
                  <label className="ai-setting-label">Model Name</label>
                  <input
                    type="text"
                    className="ai-setting-input"
                    value={apiConfig.model}
                    onInput={(e) =>
                      setApiConfig({ ...apiConfig, model: e.target.value })
                    }
                    placeholder="gpt-3.5-turbo"
                  />
                </div>
                <p className="ai-settings-tip">
                  Use any OpenAI-compatible API (OpenRouter, Groq, DeepSeek,
                  etc.)
                </p>
              </>
            )}

            {!apiConfig.useRemote && (
              <>
                <div className="ai-setting-item">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <label className="ai-setting-label">
                      Local Model (Hugging Face)
                    </label>
                    <button
                      className="ai-reset-link"
                      onClick={() =>
                        setApiConfig({
                          ...apiConfig,
                          localModelId: "onnx-community/LFM2-350M-ONNX",
                        })
                      }
                    >
                      Reset to Default
                    </button>
                  </div>
                  <input
                    type="text"
                    className="ai-setting-input"
                    value={tempModelId !== null ? tempModelId : apiConfig.localModelId}
                    onInput={(e) => setTempModelId(e.target.value)}
                    placeholder="onnx-community/LFM2-350M-ONNX"
                  />
                  {(tempModelId !== null && tempModelId !== apiConfig.localModelId) && (
                    <button 
                      className="ai-apply-btn"
                      onClick={() => {
                        setApiConfig({ ...apiConfig, localModelId: tempModelId });
                        showToast("Model updated. Reloading...", "success");
                        setTimeout(() => window.location.reload(), 1000);
                      }}
                    >
                      Apply & Reload
                    </button>
                  )}
                </div>
                <div className="ai-setting-item">
                  <label
                    className="ai-setting-toggle"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={apiConfig.disableAutoDownload}
                      onChange={(e) =>
                        setApiConfig({
                          ...apiConfig,
                          disableAutoDownload: e.target.checked,
                        })
                      }
                    />
                    <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                      Disable Automatic Download
                    </span>
                  </label>
                  <p className="ai-settings-tip" style={{ marginTop: "4px" }}>
                    Prevents models from downloading until you send your first
                    message.
                  </p>
                </div>
                <div className="ai-setting-item">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "4px",
                    }}
                  >
                    <label className="ai-setting-label">Storage Used</label>
                    <span className="ai-storage-value">
                      {storageSize || "Calculating..."}
                    </span>
                  </div>
                  <button
                    className="ai-clear-cache-btn"
                    onClick={handleClearAICache}
                  >
                    <Trash2 size={14} />
                    Clear Local AI Cache
                  </button>
                </div>
                <div className="ai-local-info">
                  <Bot size={24} />
                  <p>
                    Local AI runs entirely on your device using WebGPU/WASM.
                    It's private but resource-heavy.
                  </p>
                </div>
              </>
            )}
          </div>
        ) : status === "idle" || status === "downloading" ? (
          <div className="ai-setup-view">
            <div className="ai-setup-icon">
              {status === "downloading" ? (
                <Loader2 size={40} className="animate-spin" />
              ) : (
                <Bot size={40} />
              )}
            </div>
            <h4 className="ai-setup-title">
              {status === "downloading"
                ? "Downloading AI Model"
                : "Unlock AI Assistant"}
            </h4>
            <p className="ai-setup-desc">
              {status === "downloading"
                ? "This happens once. The model is saved in your browser for offline use."
                : "To start chatting, we need to download a lightweight AI model (~350MB)."}
            </p>

            {status === "downloading" ? (
              <div className="ai-progress-container">
                <div className="ai-progress-bar">
                  <div
                    className="ai-progress-fill"
                    style={{ width: `${downloadProgress}%` }}
                  ></div>
                </div>
                <span className="ai-progress-text">
                  {Math.round(downloadProgress)}% Downloaded
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  width: "100%",
                }}
              >
                <button className="ai-download-button" onClick={onDownload}>
                  <Download size={18} />
                  Download Model
                </button>
                <button
                  className="ai-secondary-button"
                  onClick={() => setShowSettings(true)}
                >
                  Use Remote API instead
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            {messages
              .filter((m) => m.role !== "system")
              .map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role} ${isGenerating && i === messages.length - 1 ? 'streaming' : ''}`}>
                  {msg.role === "ai" ? (
                    <div
                      className="ai-md-content fade-in-text"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(msg.content),
                      }}
                    />
                  ) : (
                    msg.content
                  )}
                  {msg.role === "ai" && msg.duration && (
                    <div className="ai-message-duration">
                      {apiConfig.useRemote
                        ? "Generated via Cloud"
                        : "Generated via Device"}{" "}
                      in {msg.duration}
                    </div>
                  )}
                </div>
              ))}
            {isGenerating && (
              <div className="chat-message ai streaming-placeholder">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {(status === "ready" || apiConfig.useRemote) && !showSettings && (
        <div className="ai-chat-input-area">
          <div className="ai-chat-input-container">
            <input
              type="text"
              className="ai-chat-input"
              placeholder="Ask anything about your career..."
              value={inputValue}
              onInput={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              className="ai-send-button"
              onClick={handleSend}
              disabled={!inputValue.trim() || isGenerating}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
