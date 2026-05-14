import { useState, useEffect, useRef } from "preact/hooks";
import { h } from "preact";
import { v4 as uuidv4 } from "uuid";
import {
  Trash2,
  Plus,
  GripVertical,
} from "lucide-preact";

import { defaultData, FONT_SIZES, FONT_THEMES } from "./constants/resumeData";
import { getCustomFontFamily, updateDocumentTitle } from "./utils/helpers";
import { usePWA, useScale, useSwipe } from "./utils/hooks";

// Shared Components
import { EditableText } from "./components/shared/EditableText";
import { Controls, SectionControls } from "./components/shared/Controls";
import { FloatingBar } from "./components/shared/FloatingBar";
import { TemplateNavButtons, IndicatorDots } from "./components/shared/TemplateNav";
import { InstallBanner } from "./components/shared/InstallBanner";

// Section Components
import { SummarySection } from "./components/sections/SummarySection";
import { ExperienceSection } from "./components/sections/ExperienceSection";
import { ProjectsSection } from "./components/sections/ProjectsSection";
import { EducationSection } from "./components/sections/EducationSection";
import { SkillsSection } from "./components/sections/SkillsSection";
import { CertificationsSection } from "./components/sections/CertificationsSection";

// Template Components
import { ClassicTemplate } from "./components/templates/ClassicTemplate";
import { ModernTemplate } from "./components/templates/ModernTemplate";

export default function App() {
  const resumeRefs = useRef({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [dragSource, setDragSource] = useState(null);

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
    return "slate";
  });

  const [template, setTemplate] = useState(() => {
    return localStorage.getItem("resumeTemplate") || "classic";
  });

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("resumeData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (!parsed.headings) parsed.headings = defaultData.headings;
        if (!parsed.layout) parsed.layout = defaultData.layout;
        if (!parsed.projects) parsed.projects = defaultData.projects;
        if (parsed.linkedin === undefined)
          parsed.linkedin = defaultData.linkedin;
        if (parsed.portfolio === undefined)
          parsed.portfolio = defaultData.portfolio;
        if (!parsed.contactLayout)
          parsed.contactLayout = defaultData.contactLayout;
        return parsed;
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  const { showInstallBanner, handleInstallClick, dismissInstall } = usePWA();
  const { scale, viewportHeight } = useScale(template, data, resumeRefs);
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(setTemplate);

  useEffect(() => {
    localStorage.setItem("resumeTheme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Request Persistent Storage
  useEffect(() => {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log("Persistent storage granted. Data will not be evicted.");
        } else {
          console.log(
            "Persistent storage not granted. Data may be evicted under pressure.",
          );
        }
      });
    }
  }, []);

  // Dynamic Google Font Loader
  useEffect(() => {
    if (fontTheme === "custom" && customFont) {
      const linkId = "custom-google-font";
      let link = document.getElementById(linkId);

      let fontName = customFont.trim();
      let urlToLoad = fontName;

      // If it's just a font name like "Outfit", generate the URL
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
    localStorage.setItem("resumeData", JSON.stringify(data));
    updateDocumentTitle(data);
  }, [data]);

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

  // Keyboard Navigation for Templates
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't switch if user is typing in an input or textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
      
      if (e.key === "ArrowRight" && template === "classic") {
        setTemplate("modern");
      } else if (e.key === "ArrowLeft" && template === "modern") {
        setTemplate("classic");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [template]);

  const handleChange = (key, value) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleHeadingChange = (key, value) => {
    setData((prev) => ({
      ...prev,
      headings: { ...prev.headings, [key]: value },
    }));
  };

  const handleArrayChange = (section, index, key, value) => {
    const newArray = [...data[section]];
    newArray[index][key] = value;
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const handleBulletChange = (section, itemIndex, bulletIndex, value) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets[bulletIndex] = value;
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const addBullet = (section, itemIndex) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets.push("New bullet point");
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const removeBullet = (section, itemIndex, bulletIndex) => {
    const newArray = [...data[section]];
    newArray[itemIndex].bullets.splice(bulletIndex, 1);
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const deleteItem = (section, index) => {
    const newArray = [...data[section]];
    newArray.splice(index, 1);
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const addItem = (section) => {
    const newArray = [...data[section]];
    if (section === "experience") {
      newArray.push({
        id: uuidv4(),
        title: "New Job Title",
        date: "Year - Year",
        company: "Company Name",
        location: "City",
        bullets: ["New responsibility"],
      });
    } else if (section === "projects") {
      newArray.push({
        id: uuidv4(),
        name: "New Project",
        link: "",
        description: "Project description.",
      });
    } else if (section === "education") {
      newArray.push({
        id: uuidv4(),
        degree: "New Degree",
        date: "Year - Year",
        institution: "University Name",
        location: "City",
      });
    } else if (section === "skills") {
      newArray.push({ id: uuidv4(), name: "New Skill" });
    } else if (section === "certifications") {
      newArray.push({
        id: uuidv4(),
        name: "New Cert",
        org: "Organization",
        year: "Year",
      });
    }
    setData((prev) => ({ ...prev, [section]: newArray }));
  };

  const resetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data to the default template?",
      )
    ) {
      setData(defaultData);
      setFontSize("medium");
      setFontTheme("modern");
      setCustomFont("");
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const deleteSection = (index) => {
    const newLayout = [...data.layout];
    newLayout.splice(index, 1);
    setData((prev) => ({ ...prev, layout: newLayout }));
  };

  const insertPageBreak = (index) => {
    const newLayout = [...data.layout];
    newLayout.splice(index + 1, 0, { id: uuidv4(), type: "pageBreak" });
    setData((prev) => ({ ...prev, layout: newLayout }));
  };

  const handleDragStart = (index, type, parentIndex = null) => {
    setDragSource({ index, type, parentIndex });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (index, type, parentIndex = null) => {
    if (
      !dragSource ||
      dragSource.type !== type ||
      dragSource.parentIndex !== parentIndex ||
      dragSource.index === index
    )
      return;

    setData((prev) => {
      const newData = { ...prev };
      let list;

      if (type === "layout") {
        list = [...newData.layout];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData.layout = list;
      } else if (type === "contact") {
        list = [...newData.contactLayout];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData.contactLayout = list;
      } else {
        // Experience, Projects, Education, Skills, Certifications
        list = [...newData[type]];
        const item = list.splice(dragSource.index, 1)[0];
        list.splice(index, 0, item);
        newData[type] = list;
      }

      return newData;
    });
    setDragSource(null);
  };

  const handlePrint = () => {
    setIsEditMode(false);

    const isMobile = window.innerWidth < 840;
    if (isMobile) {
      document.body.classList.add("mobile-print");
    }

    const cleanupPrint = () => {
      document.body.classList.remove("mobile-print");
      window.removeEventListener("afterprint", cleanupPrint);
    };

    window.addEventListener("afterprint", cleanupPrint);

    // Call print
    window.print();

    // Fallback cleanup for mobile browsers
    setTimeout(cleanupPrint, 10000); // 10 seconds
  };


  const renderSection = (sec, index) => {
    const commonProps = {
      index,
      onDelete: () => deleteSection(index),
      onAddBreak: () => insertPageBreak(index),
      isEditMode,
    };

    const sectionProps = {
      key: sec.id,
      className: `section relative-box sec-box section-${sec.type} ${dragSource?.type === "layout" && dragSource?.index === index ? "dragging" : ""}`,
      draggable: isEditMode,
      onDragStart: () => handleDragStart(index, "layout"),
      onDragOver: handleDragOver,
      onDrop: () => handleDrop(index, "layout"),
      onDragEnd: () => setDragSource(null),
    };

    const sectionArgs = {
      data,
      isEditMode,
      sectionProps,
      commonProps,
      dragSource,
      handleDragStart,
      handleDragOver,
      handleDrop,
      setDragSource,
      handleHeadingChange,
      handleChange,
      handleArrayChange,
      handleBulletChange,
      removeBullet,
      addBullet,
      addItem,
      deleteItem,
    };

    switch (sec.type) {
      case "summary":
        return <SummarySection {...sectionArgs} />;
      case "experience":
        return <ExperienceSection {...sectionArgs} />;
      case "projects":
        return <ProjectsSection {...sectionArgs} />;
      case "education":
        return <EducationSection {...sectionArgs} />;
      case "skills":
        return <SkillsSection {...sectionArgs} />;
      case "certifications":
        return <CertificationsSection {...sectionArgs} />;
      case "pageBreak":
        return (
          <div
            {...sectionProps}
            className={`page-break relative-box sec-box ${dragSource?.type === "layout" && dragSource?.index === index ? "dragging" : ""}`}
          >
            <SectionControls {...commonProps} />
            <div className="page-break-indicator hide-print">
              ----- Page Break -----
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const dynamicFontTheme =
    fontTheme === "custom"
      ? {
          "--font-heading": getCustomFontFamily(customFont),
          "--font-body": getCustomFontFamily(customFont),
        }
      : FONT_THEMES[fontTheme];

  return (
    <>
      <div className="perspective-grid hide-print"></div>
      <FloatingBar
        isEditMode={isEditMode}
        setIsEditMode={setIsEditMode}
        resetData={resetData}
        handlePrint={handlePrint}
        fontTheme={fontTheme}
        setFontTheme={setFontTheme}
        fontSize={fontSize}
        setFontSize={setFontSize}
        customFont={customFont}
        setCustomFont={setCustomFont}
      />

      {/* Wrapper for Side Arrows and Resume */}
      <div className="resume-wrapper">
        <TemplateNavButtons setTemplate={setTemplate} />

        <div
          className="resume-slider-viewport hide-scrollbar"
          style={{
            width: scale < 1 ? `${800 * scale}px` : "100%",
            height: viewportHeight,
            transition: "height 0.3s ease",
            margin: "0 auto",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            className={`resume-slider template-active-${template}`}
            style={{
              position: scale < 1 ? "absolute" : "relative",
              top: 0,
              left: 0,
              transform: `scale(${scale}) translateX(${template === "modern" ? "-800px" : "0"})`,
              transformOrigin: "top left",
              width: "1600px",
              display: "flex",
            }}
          >
            <ClassicTemplate
              data={data}
              isEditMode={isEditMode}
              template={template}
              fontSize={fontSize}
              FONT_SIZES={FONT_SIZES}
              dynamicFontTheme={dynamicFontTheme}
              resumeRefs={resumeRefs}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              handleChange={handleChange}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              setDragSource={setDragSource}
              dragSource={dragSource}
              renderSection={renderSection}
            />

            <ModernTemplate
              data={data}
              isEditMode={isEditMode}
              template={template}
              fontSize={fontSize}
              FONT_SIZES={FONT_SIZES}
              dynamicFontTheme={dynamicFontTheme}
              resumeRefs={resumeRefs}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              handleChange={handleChange}
              renderSection={renderSection}
            />
          </div>
        </div>
      </div>

      <IndicatorDots template={template} setTemplate={setTemplate} />

      <InstallBanner
        showInstallBanner={showInstallBanner}
        handleInstallClick={handleInstallClick}
        dismissInstall={dismissInstall}
      />
    </>
  );
}
