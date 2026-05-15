/**
 * Minifies resume data for efficient AI prompt usage.
 * Removes IDs and redundant structural elements to save tokens.
 */
export function minifyResumeData(data) {
  if (!data) return "";

  const minified = {
    name: data.name,
    profession: data.profession,
    email: data.email,
    phone: data.phone,
    linkedin: data.linkedin,
    portfolio: data.portfolio,
    location: data.location,
    summary: data.summary,
    experience: data.experience?.map((e) => ({
      title: e.title,
      company: e.company,
      bullets: e.bullets,
      date: e.date,
      location: e.location,
    })),
    education: data.education?.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      date: e.date,
      location: e.location,
    })),
    skills: data.skills?.map((s) => ({ name: s.name })),
    projects: data.projects?.map((p) => ({
      name: p.name,
      description: p.description,
      link: p.link,
    })),
    certifications: data.certifications?.map((c) => ({
      name: c.name,
      org: c.org,
      year: c.year,
    })),
  };

  return JSON.stringify(minified);
}

/**
 * Safely formats simple markdown into HTML.
 * Handles bold, italic, and bullet points while escaping raw HTML.
 */
export function formatMarkdown(text) {
  if (!text) return "";

  // 1. Escape existing HTML to prevent XSS
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Format Headings (### text, ## text, # text)
  html = html.replace(/^### (.*?)$/gm, "<h4>$1</h4>");
  html = html.replace(/^## (.*?)$/gm, "<h3>$1</h3>");
  html = html.replace(/^# (.*?)$/gm, "<h2>$1</h2>");

  // 3. Format Bold (**text** or __text__)
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.*?)__/g, "<strong>$1</strong>");

  // 3. Format Italic (*text* or _text_)
  html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");
  html = html.replace(/_(.*?)_/g, "<em>$1</em>");

  // 4. Format Code Blocks (```code```)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (match, lang, code) => {
    let finalCode = code.trim();
    if (lang === "json") {
      try {
        finalCode = JSON.stringify(JSON.parse(finalCode), null, 2);
      } catch (e) {
        // Keep original if parsing fails
      }
    }
    return `<pre class="ai-code-block" data-lang="${lang}"><code>${finalCode}</code></pre>`;
  });

  // 5. Format Inline Code (`code`)
  html = html.replace(/`(.*?)`/g, "<code>$1</code>");

  // 5. Format Lists (- item or * item)
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
      const content = trimmedLine.substring(2);
      let res = "";
      if (!inList) {
        res = '<ul class="ai-md-list">';
        inList = true;
      }
      return res + `<li>${content}</li>`;
    } else if (inList) {
      inList = false;
      return `</ul>${line}`;
    }
    return line !== "" ? line + "<br/>" : line;
  });

  if (inList) processedLines.push("</ul>");

  return processedLines.join("");
}

/**
 * Fetches response from an OpenAI-compatible API.
 * Supports streaming and standard chat completion format.
 */
export async function fetchRemoteAI(messages, config, onStream) {
  const { url, key, model, tools } = config;

  const body = {
    model: model || "gpt-3.5-turbo",
    messages,
    stream: !!onStream,
  };

  if (tools) {
    body.tools = tools;
    // body.tool_choice = "auto"; // Default is auto
  }

  const chatUrl = url.endsWith("/chat/completions")
    ? url
    : `${url.replace(/\/$/, "")}/chat/completions`;

  const response = await fetch(chatUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API Error: ${response.status}`);
  }

  if (!onStream) {
    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Handle streaming
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = "";
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); // Keep the last partial line in the buffer

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;

        const dataStr = trimmed.replace(/^data:\s*/, "").trim();
        if (dataStr === "[DONE]") continue;

        try {
          const json = JSON.parse(dataStr);
          const content = json.choices[0]?.delta?.content || "";
          if (content) {
            fullContent += content;
            onStream(content);
          }
        } catch (e) {
          // Ignore partial or invalid JSON in a single SSE message
          console.warn("Failed to parse SSE JSON:", dataStr, e);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullContent;
}

export async function checkRemoteStatus(config) {
  const { url, key } = config;
  if (!url || !key) return false;

  try {
    const modelsUrl = url.endsWith("/chat/completions")
      ? url.replace("/chat/completions", "/models")
      : `${url.replace(/\/$/, "")}/models`;

    // Attempt to hit the models endpoint as a lightweight connectivity check
    const response = await fetch(modelsUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });
    return response.ok;
  } catch (e) {
    return false;
  }
}

