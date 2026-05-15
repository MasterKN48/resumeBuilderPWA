/**
 * Shared AI Configuration Manager
 * Handles persistence and retrieval of AI settings (local/remote).
 */

const DEFAULT_CONFIG = {
  useRemote: false,
  url: "https://api.openai.com/v1",
  key: "",
  model: "gpt-3.5-turbo",
  localModelId: "onnx-community/LFM2-350M-ONNX",
  disableAutoDownload: false,
};

export const getAIConfig = () => {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  const saved = localStorage.getItem("ai_api_config");
  return saved ? JSON.parse(saved) : DEFAULT_CONFIG;
};

export const saveAIConfig = (config) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ai_api_config", JSON.stringify(config));
};
