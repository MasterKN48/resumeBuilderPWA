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
      summary: data.summary,
      contact: data.contactLayout,
    },
    exp: data.experience?.map((e) => ({
      role: e.title,
      co: e.company,
      tasks: e.bullets,
    })),
    edu: data.education?.map((e) => ({
      deg: e.degree,
      inst: e.institution,
    })),
    skills: data.skills?.map((s) => s.name),
    projects: data.projects?.map((p) => ({
      n: p.name,
      d: p.description,
    })),
    summary: data.summary,
    certs: data.certifications?.map((c) => ({
      n: c.name,
      o: c.org,
      y: c.year,
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
