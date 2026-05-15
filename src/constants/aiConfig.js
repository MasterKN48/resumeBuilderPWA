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
  {
    type: "function",
    function: {
      name: "add_item",
      description: "Add a new blank item to a list section.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "The section to add to (e.g., 'experience', 'projects', 'education', 'skills', 'certifications')",
          },
        },
        required: ["section"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_item",
      description: "Delete an item from a list section by its index.",
      parameters: {
        type: "object",
        properties: {
          section: {
            type: "string",
            description: "The section to delete from (e.g., 'experience', 'skills')",
          },
          index: {
            type: "number",
            description: "The 0-based index of the item to delete",
          },
        },
        required: ["section", "index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "move_section",
      description: "Move a section in the layout to a new position.",
      parameters: {
        type: "object",
        properties: {
          oldIndex: {
            type: "number",
            description: "The current 0-based index of the section",
          },
          newIndex: {
            type: "number",
            description: "The target 0-based index for the section",
          },
        },
        required: ["oldIndex", "newIndex"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_section",
      description: "Delete an entire section from the layout.",
      parameters: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "The 0-based index of the section to delete",
          },
        },
        required: ["index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "print_resume",
      description: "Trigger the print dialog to export the resume as PDF.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
  {
    type: "function",
    function: {
      name: "change_template",
      description: "Switch the resume visual template/style.",
      parameters: {
        type: "object",
        properties: {
          template: {
            type: "string",
            enum: ["classic", "modern"],
            description: "The name of the template to switch to",
          },
        },
        required: ["template"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_page_break",
      description: "Insert a manual page break after a specific section.",
      parameters: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "The 0-based index of the section after which to insert the break",
          },
        },
        required: ["index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "delete_page_break",
      description: "Remove a manual page break from the layout.",
      parameters: {
        type: "object",
        properties: {
          index: {
            type: "number",
            description: "The 0-based index of the page break to remove",
          },
        },
        required: ["index"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_font_style",
      description: "Change the font family of the resume.",
      parameters: {
        type: "object",
        properties: {
          fontName: {
            type: "string",
            description: "The name of a Google Font (e.g., 'Inter', 'Roboto', 'Open Sans')",
          },
        },
        required: ["fontName"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_font_size",
      description: "Change the base font size preset.",
      parameters: {
        type: "object",
        properties: {
          size: {
            type: "string",
            enum: ["small", "medium", "large"],
            description: "The font size preset to use",
          },
        },
        required: ["size"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "set_font_scale",
      description: "Fine-tune the overall scaling of the resume content to fit better on pages.",
      parameters: {
        type: "object",
        properties: {
          scale: {
            type: "number",
            description: "A scale factor between 0.5 and 1.5 (default is 1.0)",
          },
        },
        required: ["scale"],
      },
    },
  },
];

export const AI_CONFIG = {
  MODEL_ID: import.meta.env.VITE_AI_MODEL || "onnx-community/LFM2-350M-ONNX",
  SYSTEM_PROMPT: ASSISTANT_PROMPT,
  TOOLS: RESUME_TOOLS,
};

