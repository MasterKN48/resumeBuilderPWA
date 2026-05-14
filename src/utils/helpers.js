export const parseMarkdown = (text, h) => {
  if (typeof text !== "string") return text;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return h(
        "strong",
        {
          key: index,
          style: { fontWeight: 700, color: "var(--text-main)" },
        },
        part.slice(2, -2)
      );
    }
    return part;
  });
};

export const getCustomFontFamily = (customFont) => {
  if (!customFont) return "sans-serif";
  const match = customFont.match(/family=([^:&]+)/);
  if (match) return `'${match[1].replace(/\+/g, " ")}', sans-serif`;
  if (!customFont.includes("http")) return `'${customFont}', sans-serif`;
  return "sans-serif";
};

export const updateDocumentTitle = (data) => {
  const userName = (data.name || "USER")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  const year = new Date().getFullYear();
  document.title = `001-${userName}-${year}`;
};
