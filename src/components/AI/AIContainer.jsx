import { useState, useEffect, useRef } from "preact/hooks";
import { AIChatButton } from "./AIChatButton";
import { AIChatWindow } from "./AIChatWindow";
import { AI_CONFIG } from "../../constants/aiConfig";
import { SUMMARIZER_PROMPT } from "../../constants/prompts";
import { minifyResumeData } from "../../utils/aiUtils";
import "../../styles/ai-chatbot.css";

export function AIContainer({ resumeData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, downloading, loading, ready, error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        "Hello! I'm your AI career assistant. How can I help you with your resume today?",
    },
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const generationStartTime = useRef(null);
  const statusRef = useRef(status);
  const resumeDataRef = useRef(resumeData);
  const pendingMessageRef = useRef(null);
  const worker = useRef(null);

  // Sync refs with state/props
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    resumeDataRef.current = resumeData;
  }, [resumeData]);

  // Initialize Worker
  useEffect(() => {
    // Create the worker
    worker.current = new Worker(
      new URL("../../utils/aiWorker.js", import.meta.url),
      {
        type: "module",
      },
    );

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
              updated[updated.length - 1] = {
                ...last,
                content: last.content + content,
              };
              return updated;
            }
            return [...prev, { role: "ai", content }];
          });
          break;
        case "summarize_complete":
          console.log("### summarize_complete ###", content);
          const pendingMsg = pendingMessageRef.current;
          
          const nextMessages = [
            {
              role: "system",
              content: `Previous conversation summary: ${content}`,
            },
            { role: "user", content: pendingMsg },
          ];

          setMessages(nextMessages);

          // Now trigger the actual generation using the summary context
          const minData = minifyResumeData(resumeDataRef.current);
          const sysPrompt = `
RESUME CONTEXT:
${minData}

CORE INSTRUCTIONS:
${AI_CONFIG.SYSTEM_PROMPT}
          `.trim();

          worker.current.postMessage({
            type: "generate",
            model_id: AI_CONFIG.MODEL_ID,
            system_prompt: sysPrompt,
            messages: nextMessages,
          });

          pendingMessageRef.current = null;
          break;

        case "complete":
          const duration = (
            (Date.now() - generationStartTime.current) /
            1000
          ).toFixed(1);

          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "ai") {
              updated[updated.length - 1] = {
                ...last,
                content,
                duration: `${duration}s`,
              };
              return updated;
            }
            return [...prev, { role: "ai", content, duration: `${duration}s` }];
          });
          setIsGenerating(false);
          setChatCount((prev) => prev + 1);
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
      if (statusRef.current === "idle") {
        worker.current.postMessage({
          type: "load",
          model_id: AI_CONFIG.MODEL_ID,
        });
      }
    }, 5000); // 5 seconds delay to prioritize main content

    return () => {
      clearTimeout(bgTimer);
      worker.current?.terminate();
    };
  }, []);

  // Trigger load immediately when chat is opened if status is idle
  useEffect(() => {
    if (isOpen && status === "idle") {
      worker.current.postMessage({
        type: "load",
        model_id: AI_CONFIG.MODEL_ID,
      });
    }
  }, [isOpen]);

  const handleDownload = () => {
    setStatus("downloading");
    worker.current.postMessage({ type: "load", model_id: AI_CONFIG.MODEL_ID });
  };

  const handleSendMessage = (content) => {
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsGenerating(true);
    generationStartTime.current = Date.now();

    const minifiedData = minifyResumeData(resumeDataRef.current);
    const contextPrompt = `
RESUME CONTEXT:
${minifiedData}

CORE INSTRUCTIONS:
${AI_CONFIG.SYSTEM_PROMPT}
    `.trim();

    // Check if we need to summarize (every 3rd message, if we have enough context)
    if (chatCount > 0 && chatCount % 3 === 0 && messages.length > 2) {
      pendingMessageRef.current = content; // Save message to process after summary
      worker.current.postMessage({
        type: "summarize",
        model_id: AI_CONFIG.MODEL_ID,
        system_prompt: SUMMARIZER_PROMPT,
        messages: messages.slice(1), // Skip the initial greeting
      });
      return;
    }

    // Filter messages to only send the summary context and the latest user message
    const filteredMessages = newMessages.filter((msg, idx) => {
      // Keep previous summaries (system role)
      if (msg.role === "system") return true;
      // Keep only the current user message (the last one)
      if (idx === newMessages.length - 1) return true;
      return false;
    });

    worker.current.postMessage({
      type: "generate",
      model_id: AI_CONFIG.MODEL_ID,
      system_prompt: contextPrompt,
      messages: filteredMessages,
    });
  };

  return (
    <div className="ai-container hide-print">
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
