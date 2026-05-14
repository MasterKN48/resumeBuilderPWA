// Web Worker for AI Inference
// Using CDN import to bypass local resolution issues if package is not yet installed
// v4.2.0 is the current stable v4
import {
  pipeline,
  env,
  TextStreamer,
} from "https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.2.0";

// Configure environment for WebGPU and custom cache
env.allowLocalModels = false;
env.useBrowserCache = true;

class TextGenerationPipeline {
  static model_id = null;
  static instance = null;

  static async getInstance(model_id, progress_callback = null) {
    if (this.instance === null || this.model_id !== model_id) {
      this.model_id = model_id;
      this.instance = await pipeline("text-generation", model_id, {
        progress_callback,
        device: "webgpu",
        dtype: "q4f16",
      });
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
      console.log("### formattedMessages ###\n", formattedMessages);
      const output = await generator(formattedMessages, {
        max_new_tokens: 2048,
        temperature: 0.7,
        do_sample: true,
        top_k: 50,
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

      let prompt = `<|system|>\n${system_prompt || ""}\n`;
      messages.forEach((m) => {
        prompt += `${m.role === "user" ? "User" : "Assistant"}: ${m.content}\n`;
      });
      prompt += `\nExtremely concise summary:`;

      const output = await generator(prompt, {
        max_new_tokens: 128,
        temperature: 0.3, // Lower temperature for more focused summary
        do_sample: false,
      });

      const finalContent = output[0].generated_text
        .split("summary:")
        .pop()
        .trim();
      self.postMessage({
        type: "summarize_complete",
        content: finalContent,
      });
    } catch (error) {
      self.postMessage({ type: "error", error: error.message });
    }
  }
});
