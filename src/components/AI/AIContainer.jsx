import { useState, useEffect, useRef } from "preact/hooks";
import { AIChatButton } from "./AIChatButton";
import { AIChatWindow } from "./AIChatWindow";
import { AI_CONFIG } from "../../constants/aiConfig";
import { SUMMARIZER_PROMPT } from "../../constants/prompts";
import { minifyResumeData, fetchRemoteAI, checkRemoteStatus } from "../../utils/aiUtils";
import { getAIConfig, saveAIConfig } from "../../utils/aiConfigManager";
import "../../styles/ai-chatbot.css";

const INITIAL_MESSAGES = [
  {
    role: "ai",
    content:
      "Hello! I'm your AI career assistant. How can I help you with your resume today?",
  },
];

export function AIContainer({ resumeData, showToast, onEditField }) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, downloading, loading, ready, error
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [isGenerating, setIsGenerating] = useState(false);

  // API Config for remote AI
  const [apiConfig, setApiConfig] = useState(getAIConfig());

  useEffect(() => {
    saveAIConfig(apiConfig);
  }, [apiConfig]);

  const generationStartTime = useRef(null);
  const statusRef = useRef(status);
  const resumeDataRef = useRef(resumeData);
  const pendingMessageRef = useRef(null);
  const worker = useRef(null);

  // Streaming Buffer Logic
  const streamingBuffer = useRef("");
  const isProcessingBuffer = useRef(false);
  const workerDone = useRef(false);
  const generationStats = useRef({ duration: "0s" });

  const processBuffer = () => {
    if (isProcessingBuffer.current) return;
    isProcessingBuffer.current = true;

    const tick = () => {
      if (streamingBuffer.current.length > 0) {
        // Increased speed: 2-3 characters per tick for a snappier feel
        const charCount = streamingBuffer.current.length > 150 ? 8 : 3;
        const chunk = streamingBuffer.current.slice(0, charCount);
        streamingBuffer.current = streamingBuffer.current.slice(charCount);

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last && last.role === "ai") {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
            return updated;
          }
          return [...prev, { role: "ai", content: chunk }];
        });

        setTimeout(tick, 25); // 25ms for a snappy but still smooth flow
      } else {
        isProcessingBuffer.current = false;
        if (workerDone.current) {
          finalizeGeneration();
        }
      }
    };
    tick();
  };

  const finalizeGeneration = () => {
    setMessages((prev) => {
      const updated = [...prev];
      const last = updated[updated.length - 1];
      if (last && last.role === "ai") {
        let content = last.content;

        // Tool Call Parsing
        // Pattern: [tool_name(param1="value1", param2="value2")]
        const toolCallRegex = /\[(\w+)\((.*?)\)\]/g;
        let match;
        const toolCalls = [];

        while ((match = toolCallRegex.exec(content)) !== null) {
          const toolName = match[1];
          const paramsString = match[2];
          const params = {};

          // Parse parameters: param="value"
          const paramRegex = /(\w+)="(.*?)"/g;
          let paramMatch;
          while ((paramMatch = paramRegex.exec(paramsString)) !== null) {
            params[paramMatch[1]] = paramMatch[2];
          }

          toolCalls.push({ name: toolName, params });
        }

        // Execute Tool Calls
        if (toolCalls.length > 0) {
          console.log("### AI Tool Calls Detected ###", toolCalls);
          toolCalls.forEach((call) => {
            if (
              call.name === "edit_field" &&
              call.params.path &&
              call.params.value
            ) {
              onEditField(call.params.path, call.params.value);
              showToast(`Updated ${call.params.path}`, "success");
            }
          });

          // Remove tool call strings from visible content
          content = content.replace(toolCallRegex, "").trim();
        }

        updated[updated.length - 1] = {
          ...last,
          content: content || "I've updated your resume as requested.",
          duration: generationStats.current.duration,
        };
      }
      return updated;
    });
    setIsGenerating(false);
    setChatCount((prev) => prev + 1);
    workerDone.current = false;
  };

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
      { type: "module" },
    );

    worker.current.onerror = (e) => {
      console.error("### AI Worker Global Error ###", e);
      showToast(
        "🚨 AI Assistant Crashed: " +
          (e.message || "Unknown error (likely memory limit)"),
        "error",
      );
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
          streamingBuffer.current += content;
          processBuffer();
          break;
        case "summarize_complete":
          const pendingMsg = pendingMessageRef.current;
          const nextMessages = [
            {
              role: "system",
              content: `Previous conversation summary: ${content}`,
            },
            { role: "user", content: pendingMsg },
          ];
          setMessages(nextMessages);

          const minData = minifyResumeData(resumeDataRef.current);
          const sysPrompt =
            `RESUME CONTEXT:\n${minData}\n\nCORE INSTRUCTIONS:\n${AI_CONFIG.SYSTEM_PROMPT}`.trim();

          worker.current.postMessage({
            type: "generate",
            model_id: apiConfig.localModelId,
            system_prompt: sysPrompt,
            messages: nextMessages,
            tools: AI_CONFIG.TOOLS,
          });
          pendingMessageRef.current = null;
          break;

        case "complete":
          const duration = (
            (Date.now() - generationStartTime.current) /
            1000
          ).toFixed(1);
          generationStats.current = { duration: `${duration}s` };
          workerDone.current = true;
          if (
            !isProcessingBuffer.current &&
            streamingBuffer.current.length === 0
          ) {
            finalizeGeneration();
          }
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

  // Initial Worker Setup & Re-init on mode switch/model change
  useEffect(() => {
    // 1. Handle Termination & Reset when switching modes or models
    if (worker.current) {
      const isSwitchingToRemote = apiConfig.useRemote;
      // If we are already in Local AI, check if the model ID has changed
      // (The dependency array will trigger this useEffect on ID change)

      // Check if the current worker's model differs from the target
      // We'll trust the dependency array but we need to terminate old worker
      console.log("### Mode/Model Change: Terminating Previous Worker ###");
      worker.current.terminate();
      worker.current = null;
      setStatus("idle");
      setMessages(INITIAL_MESSAGES);
    }

    // 2. Initialize if needed
    // Only auto-download if Local AI is selected AND (auto-download is enabled OR chat is open)
    if (!apiConfig.useRemote && (!apiConfig.disableAutoDownload || isOpen)) {
      if (!worker.current) {
        initWorker();
        setMessages(INITIAL_MESSAGES);
      }
    }

    return () => {
      // Termination handled by the logic above and the cleanup effect
    };
  }, [
    apiConfig.localModelId,
    apiConfig.disableAutoDownload,
    isOpen,
    apiConfig.useRemote,
  ]);
  
  // Handle remote status checking
  useEffect(() => {
    const checkStatus = async () => {
      if (apiConfig.useRemote) {
        if (apiConfig.key && apiConfig.url) {
          // If we have config, check if it's actually working
          const isReady = await checkRemoteStatus(apiConfig);
          setStatus(isReady ? "ready" : "idle");
        } else {
          setStatus("idle");
        }
      }
    };
    checkStatus();
  }, [apiConfig.useRemote, apiConfig.key, apiConfig.url]);

  // Handle manual load trigger when chat opens
  useEffect(() => {
    if (isOpen && !apiConfig.useRemote) {
      if (!worker.current) {
        initWorker();
      } else if (status === "idle") {
        worker.current.postMessage({
          type: "load",
          model_id: apiConfig.localModelId,
        });
      }
    }
  }, [isOpen, status, apiConfig.useRemote]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (worker.current) {
        worker.current.terminate();
        worker.current = null;
      }
    };
  }, []);

  const handleDownload = () => {
    setStatus("downloading");
    worker.current.postMessage({
      type: "load",
      model_id: apiConfig.localModelId,
    });
  };

  const handleSendMessage = async (content) => {
    const newMessages = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setIsGenerating(true);
    generationStartTime.current = Date.now();

    const minifiedData = minifyResumeData(resumeDataRef.current);
    const contextPrompt =
      `RESUME CONTEXT:\n${minifiedData}\n\nCORE INSTRUCTIONS:\n${AI_CONFIG.SYSTEM_PROMPT}`.trim();

    if (apiConfig.useRemote && apiConfig.key) {
      try {
        const filteredMessages = newMessages.filter((msg, idx) => {
          if (msg.role === "system") return true;
          if (idx === newMessages.length - 1) return true;
          return false;
        });

        const finalMessages = [
          { role: "system", content: contextPrompt },
          ...filteredMessages,
        ];

        setMessages((prev) => [...prev, { role: "ai", content: "" }]);

        await fetchRemoteAI(
          finalMessages,
          { ...apiConfig, tools: AI_CONFIG.TOOLS },
          (chunk) => {
            streamingBuffer.current += chunk;
            processBuffer();
          },
        );

        const duration = (
          (Date.now() - generationStartTime.current) /
          1000
        ).toFixed(1);
        generationStats.current = { duration: `${duration}s` };
        workerDone.current = true;
        if (
          !isProcessingBuffer.current &&
          streamingBuffer.current.length === 0
        ) {
          finalizeGeneration();
        }
      } catch (error) {
        console.error("Remote AI Error:", error);
        showToast("Remote AI Error: " + error.message, "error");
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
      tools: AI_CONFIG.TOOLS,
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
          showToast={showToast}
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
