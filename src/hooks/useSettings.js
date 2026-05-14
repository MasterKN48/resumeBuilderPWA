import { useState, useEffect } from "preact/hooks";
import { FONT_SIZES, FONT_THEMES } from "../constants/resumeData";
import { getCustomFontFamily } from "../utils/helpers";

export const useSettings = (data, handleChange) => {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem("resumeFontSize") || "medium";
  });

  const [fontTheme, setFontTheme] = useState(() => {
    return localStorage.getItem("resumeFontTheme") || "modern";
  });

  const [customFont, setCustomFont] = useState(() => {
    return localStorage.getItem("resumeCustomFont") || "";
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("resumeTheme") || "slate";
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem("resumeTemplate") || "classic";
  });

  useEffect(() => {
    localStorage.setItem("resumeTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Dynamic Google Font Loader
  useEffect(() => {
    if (fontTheme === "custom" && customFont) {
      const linkId = "custom-google-font";
      let link = document.getElementById(linkId);

      let fontName = customFont.trim();
      let urlToLoad = fontName;

      if (!fontName.includes("http")) {
        urlToLoad = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}:wght@400;500;600;700&display=swap`;
      }

      if (!link) {
        link = document.createElement("link");
        link.id = linkId;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
      link.href = urlToLoad;
    }
  }, [fontTheme, customFont]);

  useEffect(() => {
    localStorage.setItem("resumeFontSize", fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("resumeFontTheme", fontTheme);
  }, [fontTheme]);

  useEffect(() => {
    localStorage.setItem("resumeCustomFont", customFont);
  }, [customFont]);

  useEffect(() => {
    localStorage.setItem("resumeTemplate", template);
  }, [template]);

  const dynamicFontTheme =
    fontTheme === "custom"
      ? {
          "--font-heading": getCustomFontFamily(customFont),
          "--font-body": getCustomFontFamily(customFont),
        }
      : FONT_THEMES[fontTheme];

  const getScaledFonts = (baseFonts, scale) => {
    const scaled = {};
    for (const [key, value] of Object.entries(baseFonts)) {
      if (key.startsWith("--fs-")) {
        const num = parseFloat(value);
        const unit = value.replace(num.toString(), "");
        scaled[key] = `${num * scale}${unit}`;
      } else {
        scaled[key] = value;
      }
    }
    return scaled;
  };

  const scaledFontSizes = getScaledFonts(FONT_SIZES[fontSize], data.fontScale);

  return {
    fontSize, setFontSize,
    fontTheme, setFontTheme,
    customFont, setCustomFont,
    theme, setTheme,
    template, setTemplate,
    dynamicFontTheme,
    scaledFontSizes
  };
};
