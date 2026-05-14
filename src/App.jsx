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
    const isMobile = (document.documentElement.clientWidth || window.innerWidth) < 840;
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

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    setIsParsing(true);
    setParseProgress(0);

    try {
      const { parsePdf } = await import("./utils/pdfParser");
      const { parseResumeText } = await import("./utils/resumeParser");
      
      const text = await parsePdf(file, (progress) => {
        setParseProgress(progress);
      });

      console.log("%cPDF Parsing Complete!", "color: #d86244; font-weight: bold; font-size: 16px;");
      console.log("%cRaw Extracted Text:", "color: #94a3b8; font-weight: bold; font-size: 14px;");
      console.log(text);
      
      const parsedJson = parseResumeText(text);
      console.log("%cSemantic Extraction Result:", "color: #40e0d0; font-weight: bold; font-size: 14px;");
      console.log(parsedJson);
      
      alert("Resume parsed successfully! Check the browser console for both raw text and structured JSON.");
    } catch (error) {
      console.error("PDF parsing error:", error);
      alert("Error parsing PDF. Please make sure it's a valid PDF file.");
    } finally {
      setIsParsing(true); // Keep it briefly for the "Complete" state feel
      setParseProgress(100);
      setTimeout(() => {
        setIsParsing(false);
        setParseProgress(0);
      }, 800);
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
              {parseProgress < 100 ? "Analyzing Resume..." : "Analysis Complete!"}
            </div>
            <div className="parsing-subtext">
              {parseProgress < 100 
                ? "Our AI is extracting your professional experience..." 
                : "Text extracted successfully!"}
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${parseProgress}%` }}
              ></div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-color)' }}>
              {Math.round(parseProgress)}%
            </div>
          </div>
        </div>
      )}

      <AIContainer resumeData={data} />
    </>
  );
}
