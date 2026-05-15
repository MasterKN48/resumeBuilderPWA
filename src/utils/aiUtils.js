/**
 * Minifies resume data for efficient AI prompt usage.
 * Removes IDs and redundant structural elements to save tokens.
 */
export function minifyResumeData(data) {
  if (!data) return "";

  const minified = {
    personal: {
      name: data.name,
      title: data.profession,
      email: data.email,
      phone: data.phone,
      linkedIn: data.linkedin,
      portfolio: data.portfolio,
      location: data.location,
    },
    exp: data.experience?.map((e) => ({
      role: e.title,
      company: e.company,
      tasks: e.bullets,
      date: e.date,
      location: e.location,
    })),
    edu: data.education?.map((e) => ({
      degree: e.degree,
      institution: e.institution,
      date: e.date,
      location: e.location,
    })),
    skills: data.skills?.map((s) => s.name),
    projects: data.projects?.map((p) => ({
      name: p.name,
      description: p.description,
      link: p.link,
    })),
    summary: data.summary,
    certs: data.certifications?.map((c) => ({
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
  const { url, key, model } = config;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`
    },
    body: JSON.stringify({
      model: model || "gpt-3.5-turbo",
      messages,
      stream: !!onStream
    })
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

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const dataStr = line.substring(6).trim();
          if (dataStr === "[DONE]") continue;
          
          try {
            const json = JSON.parse(dataStr);
            const content = json.choices[0]?.delta?.content || "";
            if (content) {
              fullContent += content;
              onStream(content);
            }
          } catch (e) {
            // Ignore partial or invalid JSON
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
  
  return fullContent;
}
