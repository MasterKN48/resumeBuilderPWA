import { useState, useEffect, useRef } from "preact/hooks";

import { FONT_SIZES } from "./constants/resumeData";
import { usePWA, useScale, useSwipe } from "./utils/hooks";

// New Hooks
import { useResumeData } from "./hooks/useResumeData";
import { useSettings } from "./hooks/useSettings";
import { useLayoutManager } from "./hooks/useLayoutManager";

// Shared Components
import { FloatingBar } from "./components/shared/FloatingBar";
import {
  TemplateNavButtons,
  IndicatorDots,
} from "./components/shared/TemplateNav";
import { InstallBanner } from "./components/shared/InstallBanner";
import { SectionRenderer } from "./components/SectionRenderer";
import { FileText } from "lucide-preact";

// AI Component
import { AIContainer } from "./components/AI/AIContainer";

// Template Components
import { ClassicTemplate } from "./components/templates/ClassicTemplate";
import { ModernTemplate } from "./components/templates/ModernTemplate";

export default function App() {
  const resumeRefs = useRef({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseProgress, setParseProgress] = useState(0);
  const [parsingStatus, setParsingStatus] = useState("");

  // Core Data Management
  const {
    data,
    setData,
    handleChange,
    handleHeadingChange,
    handleArrayChange,
    handleBulletChange,
    addBullet,
    removeBullet,
    deleteItem,
    addItem,
  } = useResumeData();

  // Settings & Theme Management
  const {
    fontSize,
    setFontSize,
    fontTheme,
    setFontTheme,
    customFont,
    setCustomFont,
    theme,
    setTheme,
    template,
    setTemplate,
    dynamicFontTheme,
    scaledFontSizes,
  } = useSettings(data, handleChange);

  // Layout & Drag-and-Drop Management
  const {
    minimizedSections,
    toggleMinimize,
    deleteSection,
    insertPageBreak,
    dragSource,
    setDragSource,
    handleDragStart,
    handleDragOver,
    handleDrop,
  } = useLayoutManager(data, setData);

  const { showInstallBanner, handleInstallClick, dismissInstall } = usePWA();
  const { scale, viewportHeight } = useScale(template, data, resumeRefs);
  const { onTouchStart, onTouchMove, onTouchEnd } = useSwipe(setTemplate);

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

  // Keyboard Navigation for Templates
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      )
        return;

      if (e.key === "ArrowRight" && template === "classic") {
        setTemplate("modern");
      } else if (e.key === "ArrowLeft" && template === "modern") {
        setTemplate("classic");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [template, setTemplate]);

  const resetData = () => {
    if (
      confirm(
        "Are you sure you want to reset all data to the default template?",
      )
    ) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  const handlePrint = () => {
    setIsEditMode(false);
    const isMobile =
      (document.documentElement.clientWidth || window.innerWidth) < 840;
    if (isMobile) {
      document.body.classList.add("mobile-print");
    }

    const cleanupPrint = () => {
      document.body.classList.remove("mobile-print");
      window.removeEventListener("afterprint", cleanupPrint);
    };

    window.addEventListener("afterprint", cleanupPrint);
    window.print();
    setTimeout(cleanupPrint, 10000);
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    setIsParsing(true);
    setParseProgress(5);
    setParsingStatus("Initializing...");
    const setStatus = (msg) => {
      setParsingStatus(msg);
      // Update progress based on status keywords
      if (msg.includes("Downloading")) setParseProgress(20);
      if (msg.includes("Analyzing")) setParseProgress(60);
    };

    try {
      const { parsePdf } = await import("./utils/pdfParser");
      const { parseResumeText, parseResumeWithAI } =
        await import("./utils/resumeParser");

      // 1. Extract raw text
      const text = await parsePdf(file, (progress) => {
        setParseProgress(5 + progress * 0.4); // 5% to 45% for PDF extraction
      });

      console.log("%cPDF Text Extracted", "color: #94a3b8; font-weight: bold;");
      console.log(text);
      // 2. Parse with AI
      let parsedJson;
      try {
        setParseProgress(50);
        parsedJson = await parseResumeWithAI(text, setStatus);
      } catch (aiError) {
        console.warn("AI Parsing failed, falling back to heuristics:", aiError);
        parsedJson = parseResumeText(text);
      }

      // 3. Finalize and Save
      setParseProgress(100);

      // Merge with default structure to ensure no missing fields
      const finalData = {
        ...data,
        ...parsedJson,
        // Ensure we don't overwrite internal settings unless they are in the parsed data
        headings: { ...data.headings, ...(parsedJson.headings || {}) },
        layout: parsedJson.layout || data.layout,
      };

      setData(finalData);
      setIsEditMode(true);

      // alert(
      //   "Resume imported successfully! Our AI has extracted your details into the editor.",
      // );
    } catch (error) {
      console.error("Critical parsing error:", error);
      alert("Error parsing PDF. Please try again or use a different file.");
    } finally {
      setTimeout(() => {
        setIsParsing(false);
        setParseProgress(0);
        setParsingStatus("");
      }, 1000);
    }
  };

  const renderSection = (sec, index) => (
    <SectionRenderer
      key={sec.id}
      sec={sec}
      index={index}
      data={data}
      isEditMode={isEditMode}
      minimizedSections={minimizedSections}
      dragSource={dragSource}
      handleDragStart={handleDragStart}
      handleDragOver={handleDragOver}
      handleDrop={handleDrop}
      setDragSource={setDragSource}
      handleHeadingChange={handleHeadingChange}
      handleChange={handleChange}
      handleArrayChange={handleArrayChange}
      handleBulletChange={handleBulletChange}
      removeBullet={removeBullet}
      addBullet={addBullet}
      addItem={addItem}
      deleteItem={deleteItem}
      deleteSection={deleteSection}
      insertPageBreak={insertPageBreak}
      toggleMinimize={toggleMinimize}
    />
  );

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
        promptInjection={data.promptInjection}
        setPromptInjection={(val) => handleChange("promptInjection", val)}
        fontScale={data.fontScale}
        setFontScale={(val) => handleChange("fontScale", val)}
        handlePdfUpload={handlePdfUpload}
      />

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
              scaledFontSizes={scaledFontSizes}
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
              scaledFontSizes={scaledFontSizes}
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

      {isParsing && (
        <div className="parsing-overlay">
          <div className="parsing-card">
            <div className="parsing-icon-container">
              <FileText size={48} />
              <div className="parsing-icon-scan"></div>
            </div>
            <div className="parsing-text">
              {parseProgress < 100
                ? "Analyzing Resume..."
                : "Analysis Complete!"}
            </div>
            <div className="parsing-subtext">
              {parsingStatus ||
                (parseProgress < 100
                  ? "Our AI is extracting your professional experience..."
                  : "Text extracted successfully!")}
            </div>
            <div className="progress-bar-container">
              <div
                className="progress-bar-fill"
                style={{ width: `${parseProgress}%` }}
              ></div>
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                color: "var(--accent-color)",
              }}
            >
              {Math.round(parseProgress)}%
            </div>
          </div>
        </div>
      )}

      <AIContainer resumeData={data} />
    </>
  );
}
