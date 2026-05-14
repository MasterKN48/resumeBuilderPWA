import { ASSISTANT_PROMPT } from "./prompts";

export const AI_CONFIG = {
  MODEL_ID: import.meta.env.VITE_AI_MODEL || "onnx-community/LFM2-350M-ONNX",
  SYSTEM_PROMPT: ASSISTANT_PROMPT,
};
