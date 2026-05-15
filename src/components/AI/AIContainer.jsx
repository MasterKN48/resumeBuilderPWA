import { useState, useEffect, useRef } from "preact/hooks";
import { AIChatButton } from "./AIChatButton";
import { AIChatWindow } from "./AIChatWindow";
import { AI_CONFIG } from "../../constants/aiConfig";
import { SUMMARIZER_PROMPT } from "../../constants/prompts";
import { minifyResumeData, fetchRemoteAI } from "../../utils/aiUtils";
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

  // API Config for remote AI
  const [apiConfig, setApiConfig] = useState(() => {
    const saved = localStorage.getItem("ai_api_config");
    return saved ? JSON.parse(saved) : {
      useRemote: false,
      url: "https://api.openai.com/v1/chat/completions",
      key: "",
      model: "gpt-3.5-turbo",
      localModelId: AI_CONFIG.MODEL_ID
    };
  });

  useEffect(() => {
    localStorage.setItem("ai_api_config", JSON.stringify(apiConfig));
  }, [apiConfig]);

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

  const initWorker = () => {
    console.log("Initializing AI Worker with model:", apiConfig.localModelId);
    worker.current = new Worker(
      new URL("../../utils/aiWorker.js", import.meta.url),
      { type: "module" }
    );

    worker.current.onerror = (e) => {
      console.error("### AI Worker Global Error ###", e);
      alert("🚨 AI Assistant Crashed: " + (e.message || "Unknown error (likely memory limit)"));
      setIsGenerating(false);
      setStatus("error");
    };

    worker.current.onmessage = (event) => {
      const { type, progress, content, error } = event.data;

      switch (type) {
        case "download_progress":
          setDownloadProgress(progress.progress || 0);
          if (statusRef.current !== "downloading") setStatus("downloading");
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
          const pendingMsg = pendingMessageRef.current;
          const nextMessages = [
            { role: "system", content: `Previous conversation summary: ${content}` },
            { role: "user", content: pendingMsg },
          ];
          setMessages(nextMessages);

          const minData = minifyResumeData(resumeDataRef.current);
          const sysPrompt = `RESUME CONTEXT:\n${minData}\n\nCORE INSTRUCTIONS:\n${AI_CONFIG.SYSTEM_PROMPT}`.trim();

          worker.current.postMessage({
            type: "generate",
            model_id: apiConfig.localModelId,
            system_prompt: sysPrompt,
            messages: nextMessages,
          });
          pendingMessageRef.current = null;
          break;

        case "complete":
          const duration = ((Date.now() - generationStartTime.current) / 1000).toFixed(1);
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "ai") {
              updated[updated.length - 1] = { ...last, content, duration: `${duration}s` };
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
  };

  // Handle local model changes
  useEffect(() => {
    if (!apiConfig.useRemote && worker.current) {
      console.log("Local Model Changed, Restarting Worker...");
      worker.current.terminate();
      setStatus("idle");
      setDownloadProgress(0);
      initWorker();
      
      worker.current.postMessage({
        type: "load",
        model_id: apiConfig.localModelId,
      });
    }
  }, [apiConfig.localModelId]);

  // Initial Worker Setup
  useEffect(() => {
    initWorker();

    const bgTimer = setTimeout(() => {
      if (statusRef.current === "idle") {
        worker.current.postMessage({
          type: "load",
          model_id: apiConfig.localModelId,
        });
      }
    }, 5000);

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
        model_id: apiConfig.localModelId,
      });
    }
  }, [isOpen]);

  const handleDownload = () => {
    setStatus("downloading");
    worker.current.postMessage({ type: "load", model_id: apiConfig.localModelId });
  };

  const handleSendMessage = async (content) => {
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsGenerating(true);
    generationStartTime.current = Date.now();

    const minifiedData = minifyResumeData(resumeDataRef.current);
    const contextPrompt = `RESUME CONTEXT:\n${minifiedData}\n\nCORE INSTRUCTIONS:\n${AI_CONFIG.SYSTEM_PROMPT}`.trim();

    if (apiConfig.useRemote && apiConfig.key) {
      try {
        const filteredMessages = newMessages.filter((msg, idx) => {
          if (msg.role === "system") return true;
          if (idx === newMessages.length - 1) return true;
          return false;
        });

        const finalMessages = [
          { role: "system", content: contextPrompt },
          ...filteredMessages
        ];

        setMessages(prev => [...prev, { role: "ai", content: "" }]);

        await fetchRemoteAI(finalMessages, apiConfig, (chunk) => {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last && last.role === "ai") {
              updated[updated.length - 1] = { ...last, content: last.content + chunk };
              return updated;
            }
            return updated;
          });
        });

        const duration = ((Date.now() - generationStartTime.current) / 1000).toFixed(1);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1].duration = `${duration}s`;
          return updated;
        });
        
        setIsGenerating(false);
        setChatCount((prev) => prev + 1);
      } catch (error) {
        console.error("Remote AI Error:", error);
        alert("🚨 Remote AI Error: " + error.message);
        setIsGenerating(false);
      }
      return;
    }

    if (chatCount > 0 && chatCount % 3 === 0 && messages.length > 2) {
      pendingMessageRef.current = content;
      worker.current.postMessage({
        type: "summarize",
        model_id: apiConfig.localModelId,
        system_prompt: SUMMARIZER_PROMPT,
        messages: messages.slice(1),
      });
      return;
    }

    const filteredMessages = newMessages.filter((msg, idx) => {
      if (msg.role === "system") return true;
      if (idx === newMessages.length - 1) return true;
      return false;
    });

    worker.current.postMessage({
      type: "generate",
      model_id: apiConfig.localModelId,
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
          apiConfig={apiConfig}
          setApiConfig={setApiConfig}
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
