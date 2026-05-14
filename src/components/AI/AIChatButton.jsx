import { Sparkles } from "lucide-preact";

export function AIChatButton({ onClick, isOpen, status }) {
  const isReady = status === "ready";
  return (
    <button 
      className={`ai-chat-button ${isOpen ? 'active' : ''} ${isReady ? 'ready' : ''}`} 
      onClick={onClick}
      aria-label="Open AI Assistant"
    >
      <Sparkles size={28} fill={isOpen ? "white" : "none"} />
    </button>
  );
}
