// Web Worker for AI Inference
// Using CDN import with Vite ESM worker bundling for production compatibility
import {
  pipeline,
  env,
  TextStreamer,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";

// Global error handler for the worker itself
self.onerror = (message, source, lineno, colno, error) => {
  console.error("### AI Worker Internal Error ###", { message, lineno, error });
};

console.log("### AI Worker Script Loaded ###");
console.log("### WebGPU Support Check:", !!navigator.gpu);

// Configure environment for WebGPU and custom cache
env.allowLocalModels = false;
env.useBrowserCache = true;

class TextGenerationPipeline {
  static model_id = null;
  static instance = null;

  static async getInstance(model_id, progress_callback = null) {
    if (this.instance === null || this.model_id !== model_id) {
      this.model_id = model_id;
      try {
        console.log("### Attempting WebGPU Initialization...");
        this.instance = await pipeline("text-generation", model_id, {
          progress_callback,
          device: "webgpu",
          dtype: "q4f16",
        });
        console.log("### WebGPU Pipeline Ready");
      } catch (e) {
        console.warn("### WebGPU failed, falling back to WASM/CPU:", e);
        this.instance = await pipeline("text-generation", model_id, {
          progress_callback,
          device: "wasm",
          dtype: "fp32", // Safe fallback for WASM
        });
        console.log("### WASM Pipeline Ready");
      }
    }
    return this.instance;
  }
}

self.addEventListener("message", async (event) => {
  const { type, model_id, messages, params } = event.data;

  if (type === "load") {
    try {
      await TextGenerationPipeline.getInstance(model_id, (progress) => {
        if (progress.status === "progress") {
          self.postMessage({ type: "download_progress", progress: progress });
        }
      });
      self.postMessage({ type: "ready" });
    } catch (error) {
      self.postMessage({ type: "error", error: error.message });
    }
  } else if (type === "generate") {
    try {
      const { system_prompt } = event.data;
      console.log("### AI Starting Generation ###", { model_id, messageCount: messages.length });
      
      const generator = await TextGenerationPipeline.getInstance(model_id);

      const streamer = new TextStreamer(generator.tokenizer, {
        skip_prompt: true,
        skip_special_tokens: true,
        callback_function: (text) => {
          self.postMessage({ type: "partial_result", content: text });
        },
      });

      // Format messages for the generator (native support in v4)
      const formattedMessages = [
        { role: "system", content: system_prompt },
        ...messages,
      ];
      // console.log("### formattedMessages ###\n", formattedMessages);
      const output = await generator(formattedMessages, {
        max_new_tokens: 1024,
        temperature: 0.0, // Much lower for precision
        do_sample: false,
        top_p: 0.9,
        streamer,
        ...params,
      });

      // Final content from messages format
      const finalContent = output[0].generated_text.at(-1).content;
      self.postMessage({
        type: "complete",
        content: finalContent,
      });
    } catch (error) {
      self.postMessage({ type: "error", error: error.message });
    }
  } else if (type === "summarize") {
    try {
      const { system_prompt } = event.data;
      const generator = await TextGenerationPipeline.getInstance(model_id);

      // Use native chat format for summarization too
      const chat = [
        { role: "system", content: system_prompt },
        ...messages,
        {
          role: "user",
          content: "Summarize our conversation so far in one short sentence.",
        },
      ];

      const output = await generator(chat, {
        max_new_tokens: 1024,
        temperature: 0.2,
        do_sample: false,
      });

      const finalContent = output[0].generated_text.at(-1).content;
      self.postMessage({
        type: "summarize_complete",
        content: finalContent,
      });
    } catch (error) {
      self.postMessage({ type: "error", error: error.message });
    }
  }
});
