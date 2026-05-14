import { X, Send, Download, Bot, Loader2, RefreshCw } from "lucide-preact";
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
}) {
  const [inputValue, setInputValue] = useState("");
  const [width, setWidth] = useState(400);
  const messagesEndRef = useRef(null);
  const isResizing = useRef(false);

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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      style={{ width: typeof window !== 'undefined' && window.innerWidth > 640 ? `${width}px` : undefined }}
    >
      <div className="ai-chat-resizer" onMouseDown={startResizing}></div>
      <div className="ai-chat-header">
        <div className="ai-chat-header-info">
          <div
            className={`ai-status-indicator ${status}`}
            title={`Status: ${status}`}
          ></div>
          <h3 className="ai-chat-header-title">Pocket Assistant</h3>
        </div>
        <button className="ai-close-button" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="ai-chat-content">
        {status === "idle" || status === "downloading" ? (
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
              <button className="ai-download-button" onClick={onDownload}>
                <Download size={18} />
                Download Model
              </button>
            )}
          </div>
        ) : (
          <>
            {messages.filter(m => m.role !== 'system').map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`}>
                {msg.role === "ai" ? (
                  <div 
                    className="ai-md-content"
                    dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                  />
                ) : (
                  msg.content
                )}
                {msg.role === "ai" && msg.duration && (
                  <div className="ai-message-duration">
                    Generated in {msg.duration}
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="chat-message ai">
                <Loader2 size={16} className="animate-spin" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {status === "ready" && (
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
