import { ASSISTANT_PROMPT } from "./prompts";

export const RESUME_TOOLS = [
  {
    type: "function",
    function: {
      name: "edit_field",
      description:
        "Edit any field in the resume data. Use dot notation for nested fields (e.g., 'name', 'experience.0.title', 'skills.2').",
      parameters: {
        type: "object",
        properties: {
          path: {
            type: "string",
            description:
              "The path to the field to edit (e.g., 'summary', 'name', 'location', 'experience.1.company')",
          },

          value: {
            type: "string",
            description: "The new value for the field",
          },
        },
        required: ["path", "value"],
      },
    },
  },
];

export const AI_CONFIG = {
  MODEL_ID: import.meta.env.VITE_AI_MODEL || "onnx-community/LFM2-350M-ONNX",
  SYSTEM_PROMPT: ASSISTANT_PROMPT,
  TOOLS: RESUME_TOOLS,
};

