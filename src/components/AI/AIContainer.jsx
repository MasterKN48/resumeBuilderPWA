import { useState, useEffect, useRef } from "preact/hooks";
import { AIChatButton } from "./AIChatButton";
import { AIChatWindow } from "./AIChatWindow";
import { AI_CONFIG } from "../../constants/aiConfig";
import { minifyResumeData } from "../../utils/aiUtils";
import "../../styles/ai-chatbot.css";

export function AIContainer({ resumeData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, downloading, loading, ready, error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [messages, setMessages] = useState([
    { role: "ai", content: "Hello! I'm your AI career assistant. How can I help you with your resume today?" }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationStartTime = useRef(null);
  const worker = useRef(null);

  // Initialize Worker
  useEffect(() => {
    // Create the worker
    worker.current = new Worker(new URL("../../utils/aiWorker.js", import.meta.url), {
      type: "module",
    });

    worker.current.onmessage = (event) => {
      const { type, progress, content, error } = event.data;

      switch (type) {
        case "download_progress":
          setDownloadProgress(progress.progress || 0);
          if (status !== "downloading") setStatus("downloading");
          break;
        case "ready":
          setStatus("ready");
          break;
        case "partial_result":
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last && last.role === "ai") {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, content };
              return updated;
            }
            return [...prev, { role: "ai", content }];
          });
          break;
        case "complete":
          const duration = ((Date.now() - generationStartTime.current) / 1000).toFixed(1);
          
          if (type === "summarize_complete") {
            setMessages((prev) => {
              // The last message is the user message that triggered this
              const userMsg = prev[prev.length - 1];
              return [
                { role: "ai", content: `(Summary of previous chat): ${content}` },
                userMsg
              ];
            });
            setIsGenerating(false);
            return;
          }

          setMessages((prev) => [...prev, { 
            role: "ai", 
            content, 
            duration: `${duration}s` 
          }]);
          setIsGenerating(false);
          setChatCount(prev => prev + 1);
          break;
        case "error":
          console.error("AI Worker Error:", error);
          setStatus("error");
          setIsGenerating(false);
          break;
      }
    };

    // Silent background download check after a short delay
    const bgTimer = setTimeout(() => {
      if (status === "idle") {
        worker.current.postMessage({ type: 'load', model_id: AI_CONFIG.MODEL_ID });
      }
    }, 5000); // 5 seconds delay to prioritize main content

    return () => {
      clearTimeout(bgTimer);
      worker.current?.terminate();
    };
  }, []);

  const handleDownload = () => {
    setStatus("downloading");
    worker.current.postMessage({ type: "load", model_id: AI_CONFIG.MODEL_ID });
  };

  const handleSendMessage = (content) => {
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsGenerating(true);
    generationStartTime.current = Date.now();

    const minifiedData = minifyResumeData(resumeData);
    const contextPrompt = `${AI_CONFIG.SYSTEM_PROMPT}\n\nUSER RESUME DATA (JSON): ${minifiedData}`;

    // Check if we need to summarize (every 4th message, if we have enough context)
    if (chatCount > 0 && chatCount % 4 === 0 && messages.length > 3) {
      worker.current.postMessage({
        type: "summarize",
        model_id: AI_CONFIG.MODEL_ID,
        system_prompt: "You are a summarizer. Provide a extremely concise 1-sentence summary of the following conversation history. Do not use conversational filler.",
        messages: messages.slice(1), // Skip the initial greeting
      });
      // We still want to add the user's message, it will be kept after summarization
      return;
    }

    worker.current.postMessage({
      type: "generate",
      model_id: AI_CONFIG.MODEL_ID,
      system_prompt: contextPrompt,
      messages: newMessages,
    });
  };

  return (
    <div className="ai-container">
      {isOpen && (
        <AIChatWindow 
          onClose={() => setIsOpen(false)}
          status={status}
          downloadProgress={downloadProgress}
          onDownload={handleDownload}
          messages={messages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
        />
      )}
      <AIChatButton 
        onClick={() => setIsOpen(!isOpen)} 
        isOpen={isOpen}
        status={status}
      />
    </div>
  );
}
